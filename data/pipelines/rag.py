from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from qdrant_client import QdrantClient, models

from data.process.rag import load_corpus_chunks


ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CORPUS_DIR = ROOT_DIR / "docs" / "company-knowledge-base"
COLLECTION_NAME = "trackflow_knowledge"
DEFAULT_MIN_SCORE = 0.35
DEFAULT_K = 3


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
    import litellm

    try:
        response = litellm.embedding(
            model=settings["embedding_model"],
            input=texts,
            api_key=settings["api_key"],
            api_base=settings["api_base"],
        )
    except Exception as error:
        raise RAGUnavailableError("No se pudieron generar los embeddings") from error
    return [[float(value) for value in item["embedding"]] for item in response.data]


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

    qdrant = client or _cached_qdrant_client()
    query_vector = _embed_texts([question])[0]
    try:
        response = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=k,
            score_threshold=min_score,
            with_payload=True,
        )
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

    import litellm

    try:
        response = litellm.completion(
            model=settings["llm_model"],
            api_key=settings["api_key"],
            api_base=settings["api_base"],
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Contexto recuperado:\n{context_text}\n\nPregunta: {question}",
                },
            ],
        )
    except Exception as error:
        raise RAGUnavailableError("No se pudo generar la respuesta") from error

    answer = response.choices[0].message.content
    if not isinstance(answer, str) or not answer.strip():
        raise RAGUnavailableError("LiteLLM devolvió una respuesta vacía")
    return answer.strip()


def query(
    question: str,
    *,
    k: int = DEFAULT_K,
    min_score: float = DEFAULT_MIN_SCORE,
    client: QdrantClient | None = None,
) -> dict[str, Any]:
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