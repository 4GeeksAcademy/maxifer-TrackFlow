from __future__ import annotations

import asyncio
import os
from functools import lru_cache
from pathlib import Path
from typing import Any
from time import monotonic
from uuid import NAMESPACE_URL, uuid5

from qdrant_client import AsyncQdrantClient, QdrantClient, models

from data.process.rag import load_corpus_chunks
from data.pipelines.rag_runtime import (
    EMBEDDING_TIMEOUT_SECONDS, GENERATION_TIMEOUT_SECONDS, QUERY_TIMEOUT_SECONDS,
    SEARCH_TIMEOUT_SECONDS, RAGRequestTimeout, answer_cache, cache_key, deadline,
    embedding_cache, remaining_timeout, request_model,
)


ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CORPUS_DIR = ROOT_DIR / "docs" / "company-knowledge-base"
COLLECTION_NAME = "trackflow_knowledge"
DEFAULT_MIN_SCORE = 0.35
DEFAULT_K = 3
MODEL_TIMEOUT_SECONDS = 45


class RAGConfigurationError(RuntimeError):
    pass


class RAGUnavailableError(RuntimeError):
    pass


def _settings() -> dict[str, str]:
    settings = {
        "api_key": os.getenv("LITELLM_API_KEY", "").strip(),
        "api_base": os.getenv("LITELLM_API_BASE", "").strip(),
        "embedding_model": os.getenv("RAG_EMBEDDING_MODEL", "").strip(),
        "llm_model": os.getenv("RAG_LLM_MODEL", "").strip(),
        "qdrant_url": os.getenv("QDRANT_URL", "http://localhost:6333").strip(),
    }
    missing = [key for key, value in settings.items() if key != "qdrant_url" and not value]
    if missing:
        raise RAGConfigurationError(
            "Falta configuración RAG para LiteLLM: " + ", ".join(missing)
        )
    if settings["embedding_model"] == settings["llm_model"]:
        raise RAGConfigurationError(
            "RAG_EMBEDDING_MODEL debe ser distinto de RAG_LLM_MODEL"
        )
    return settings


def _qdrant_client() -> QdrantClient:
    return QdrantClient(url=_settings()["qdrant_url"])


@lru_cache(maxsize=1)
def _cached_qdrant_client() -> QdrantClient:
    return _qdrant_client()


def _embed_texts(texts: list[str]) -> list[list[float]]:
    settings = _settings()
    try:
        response = request_model(
            settings, "/embeddings",
            {"model": settings["embedding_model"].removeprefix("litellm/"),
             "input": texts, "encoding_format": "float"},
            EMBEDDING_TIMEOUT_SECONDS if len(texts) == 1 else MODEL_TIMEOUT_SECONDS,
        )
        data = sorted(response["data"], key=lambda item: item["index"])
        if len(data) != len(texts) or [item["index"] for item in data] != list(range(len(texts))):
            raise ValueError("Cantidad u orden de embeddings inválidos")
        vectors = [[float(value) for value in item["embedding"]] for item in data]
        if any(not vector for vector in vectors):
            raise ValueError("Embedding vacío")
        return vectors
    except RAGRequestTimeout as error:
        raise RAGUnavailableError("El modelo de embeddings tardó demasiado. Vuelve a intentarlo.") from error
    except Exception as error:
        raise RAGUnavailableError("No se pudieron generar los embeddings") from error


def _ensure_collection(
    client: QdrantClient, vector_size: int, replace: bool = False
) -> None:
    exists = client.collection_exists(COLLECTION_NAME)
    if exists and replace:
        client.delete_collection(COLLECTION_NAME)
        exists = False

    if not exists:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=vector_size, distance=models.Distance.COSINE
            ),
        )
        return

    collection = client.get_collection(COLLECTION_NAME)
    vector_config = collection.config.params.vectors
    if isinstance(vector_config, dict):
        raise RAGConfigurationError("La colección debe tener un único vector")
    if vector_config.size != vector_size:
        raise RAGConfigurationError(
            "La dimensión del modelo de embeddings no coincide con Qdrant; vuelva a ejecutar setup()"
        )


def embed(
    chunks: list[dict[str, Any]],
    *,
    client: QdrantClient | None = None,
    replace_collection: bool = False,
) -> int:
    if not chunks:
        return 0

    qdrant = client or _cached_qdrant_client()
    answer_cache.clear()
    embedding_cache.clear()
    try:
        vectors = _embed_texts([str(chunk["text"]) for chunk in chunks])
        if len(vectors) != len(chunks) or not vectors or not vectors[0]:
            raise RAGConfigurationError("LiteLLM devolvió una cantidad inválida de vectores")
        vector_size = len(vectors[0])
        if any(len(vector) != vector_size for vector in vectors):
            raise RAGConfigurationError("Los embeddings tienen dimensiones inconsistentes")
        _ensure_collection(qdrant, vector_size, replace=replace_collection)
        points = [
            models.PointStruct(
                id=str(uuid5(
                    NAMESPACE_URL,
                    f"{chunk['source_document']}:{chunk['chunk_index']}:{chunk['text']}",
                )),
                vector=vector,
                payload=chunk,
            )
            for chunk, vector in zip(chunks, vectors, strict=True)
        ]
        qdrant.upsert(collection_name=COLLECTION_NAME, points=points, wait=True)
    except (RAGConfigurationError, RAGUnavailableError):
        raise
    except Exception as error:
        raise RAGUnavailableError("No se pudo indexar el corpus en Qdrant") from error
    return len(points)


def setup(
    corpus_dir: str | Path = DEFAULT_CORPUS_DIR,
    *,
    client: QdrantClient | None = None,
) -> dict[str, int]:
    chunks = load_corpus_chunks(Path(corpus_dir))
    client = client or _cached_qdrant_client()
    count = embed(chunks, client=client, replace_collection=True)
    return {"documents": len({chunk["source_document"] for chunk in chunks}), "chunks": count}


async def _search(query_vector: list[float], k: int, min_score: float):
    async with asyncio.timeout(remaining_timeout(SEARCH_TIMEOUT_SECONDS)):
        # Avoid spawning a compatibility-check thread on every query. The sync
        # indexing/diagnostic client still performs that check.
        client = AsyncQdrantClient(url=_settings()["qdrant_url"], check_compatibility=False)
        try:
            return await client.query_points(
                collection_name=COLLECTION_NAME, query=query_vector, limit=k,
                score_threshold=min_score, with_payload=True,
            )
        finally:
            await client.close()


def retrieve(
    question: str,
    *,
    k: int = DEFAULT_K,
    min_score: float = DEFAULT_MIN_SCORE,
    client: QdrantClient | None = None,
) -> list[dict[str, Any]]:
    if not question.strip():
        raise ValueError("La consulta no puede estar vacía")
    if k < 1:
        raise ValueError("k debe ser mayor que cero")
    if not 0 <= min_score <= 1:
        raise ValueError("min_score debe estar entre 0 y 1")

    settings = _settings()
    remaining_timeout(QUERY_TIMEOUT_SECONDS)
    key = cache_key(settings["api_base"], settings["api_key"], settings["embedding_model"], question)
    query_vector = embedding_cache.get(key)
    if query_vector is None:
        query_vector = _embed_texts([question])[0]
        embedding_cache.put(key, query_vector)
    try:
        response = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=k,
            score_threshold=min_score,
            with_payload=True,
        ) if client is not None else asyncio.run(_search(query_vector, k, min_score))
    except TimeoutError as error:
        raise RAGUnavailableError("La búsqueda tardó demasiado. Vuelve a intentarlo.") from error
    except Exception as error:
        raise RAGUnavailableError("No se pudo consultar Qdrant") from error

    results = []
    for point in response.points:
        score = float(point.score)
        if score < min_score or not point.payload:
            continue
        results.append({**point.payload, "score": score})
    return results[:k]


def generate_answer(question: str, context: list[dict[str, Any]]) -> str:
    if not context:
        raise ValueError("La generación requiere contexto recuperado")
    settings = _settings()
    context_text = "\n\n".join(
        f"[{item['source_document']} · {item['section']}]\n{item['text']}"
        for item in context
    )
    system_prompt = """Eres un account manager de TrackFlow que responde en español durante una conversación comercial con una marca. Responde con claridad y calidez profesional usando exclusivamente el contexto proporcionado. Conserva exactamente las tarifas, porcentajes y plazos del contexto. Nunca prometas SLA durante Black Friday, Navidad o Rebajas de enero. Las devoluciones internacionales requieren gestión manual y no son automáticas. Cualquier descuento de almacenamiento requiere aprobación de Miguel Torres. Una excepción de transportista requiere aprobación de Carlos Vega. Si el contexto no contiene la respuesta o no permite confirmar una condición, dilo claramente y no inventes hechos. No escribas citas inline; la aplicación muestra la fuente por separado."""

    # Include actual indexed context so external index updates invalidate answers.
    key = cache_key(settings, question, context_text, system_prompt)
    remaining_timeout(QUERY_TIMEOUT_SECONDS)
    cached = answer_cache.get(key)
    if cached is not None:
        return cached
    try:
        response = request_model(settings, "/chat/completions", {
            "model": settings["llm_model"].removeprefix("litellm/"),
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Contexto recuperado:\n{context_text}\n\nPregunta: {question}",
                },
            ],
        }, GENERATION_TIMEOUT_SECONDS)
        choice = response["choices"][0]
        if choice.get("finish_reason") == "length":
            raise ValueError("Respuesta truncada")
        answer = choice["message"]["content"]
    except RAGRequestTimeout as error:
        raise RAGUnavailableError("El modelo de respuesta tardó demasiado. Vuelve a intentarlo.") from error
    except Exception as error:
        raise RAGUnavailableError("No se pudo generar la respuesta") from error

    if not isinstance(answer, str) or not answer.strip():
        raise RAGUnavailableError("LiteLLM devolvió una respuesta vacía")
    answer = answer.strip()
    answer_cache.put(key, answer)
    return answer


def query(
    question: str,
    *,
    k: int = DEFAULT_K,
    min_score: float = DEFAULT_MIN_SCORE,
    client: QdrantClient | None = None,
) -> dict[str, Any]:
    token = deadline.set(monotonic() + QUERY_TIMEOUT_SECONDS)
    try:
        result = _query(question, k=k, min_score=min_score, client=client)
        remaining_timeout(QUERY_TIMEOUT_SECONDS)
        return result
    except RAGRequestTimeout as error:
        raise RAGUnavailableError("La consulta tardó demasiado. Vuelve a intentarlo.") from error
    finally:
        deadline.reset(token)


def _query(question: str, *, k: int, min_score: float, client: QdrantClient | None) -> dict[str, Any]:
    context = retrieve(question, k=k, min_score=min_score, client=client)
    if not context:
        return {
            "answer": "No hay información suficiente en la base de conocimiento para responder con seguridad.",
            "sources": [],
            "retrieved_count": 0,
            "abstained": True,
        }

    answer = generate_answer(question, context)
    sources = []
    seen_sources = set()
    for item in context:
        source = (item["source_document"], item["section"])
        if source not in seen_sources:
            seen_sources.add(source)
            sources.append({"source_document": source[0], "section": source[1]})
    return {
        "answer": answer,
        "sources": sources,
        "retrieved_count": len(context),
        "abstained": False,
    }
