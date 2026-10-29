import json
from types import SimpleNamespace
from pathlib import Path

import pytest

from data.pipelines import rag
from data.process.rag import chunk_markdown, load_corpus_chunks
from data.eval.evaluate_rag import EVAL_FILE, evaluate_queries


class FakeQdrant:
    def __init__(self):
        self.exists = False
        self.points = []
        self.created_vectors = None

    def collection_exists(self, collection_name):
        return self.exists

    def delete_collection(self, collection_name):
        self.exists = False

    def create_collection(self, collection_name, vectors_config):
        self.exists = True
        self.created_vectors = vectors_config

    def upsert(self, collection_name, points, wait):
        self.points = points

    def get_collection(self, collection_name):
        return SimpleNamespace(
            config=SimpleNamespace(
                params=SimpleNamespace(vectors=self.created_vectors)
            )
        )

    def query_points(self, **kwargs):
        return SimpleNamespace(points=self.points)


def configure_models(monkeypatch):
    monkeypatch.setenv("LITELLM_API_KEY", "test-key")
    monkeypatch.setenv("LITELLM_API_BASE", "https://litellm.test")
    monkeypatch.setenv("RAG_EMBEDDING_MODEL", "embed-model")
    monkeypatch.setenv("RAG_LLM_MODEL", "chat-model")


def test_chunk_markdown_preserves_sections_and_list_units():
    chunks = chunk_markdown(
        "# Política\n\nIntroducción.\n\n## Pasos\n\n1. Solicitar.\n2. Inspeccionar.\n\nCierre.",
        "returns-policy",
    )

    assert len(chunks) == 3
    assert chunks[1]["section"] == "Política > Pasos"
    assert "1. Solicitar.\n2. Inspeccionar." in chunks[1]["text"]
    assert chunks[1]["chunk_index"] == 1


def test_load_corpus_covers_each_document_with_three_or_more_chunks():
    chunks = load_corpus_chunks(rag.ROOT_DIR / "docs" / "company-knowledge-base")
    counts = {source: 0 for source in {
        "sla-delivery", "returns-policy", "carrier-coverage", "storage-pricing"
    }}
    for chunk in chunks:
        counts[chunk["source_document"]] += 1
        assert {"company", "section", "language", "chunk_index", "text"} <= chunk.keys()
    assert all(count >= 3 for count in counts.values())


def test_setup_indexes_all_documents_and_expected_payload(monkeypatch):
    configure_models(monkeypatch)
    monkeypatch.setattr(rag, "_embed_texts", lambda texts: [[0.1, 0.2] for _ in texts])
    client = FakeQdrant()

    result = rag.setup(client=client)

    assert result["documents"] == 4
    assert result["chunks"] == len(client.points)
    assert client.created_vectors.size == 2
    assert all(point.payload["company"] == "trackflow" for point in client.points)
    assert all(point.payload["language"] == "es" for point in client.points)


def test_embed_rejects_same_embedding_and_generation_model(monkeypatch):
    configure_models(monkeypatch)
    monkeypatch.setenv("RAG_LLM_MODEL", "embed-model")

    with pytest.raises(rag.RAGConfigurationError, match="distinto"):
        rag.embed([{"text": "texto", "source_document": "sla-delivery", "chunk_index": 0}])


def test_retrieve_applies_min_score_and_limits_to_k(monkeypatch):
    configure_models(monkeypatch)
    monkeypatch.setattr(rag, "_embed_texts", lambda texts: [[1.0, 0.0]])
    client = FakeQdrant()
    client.points = [
        SimpleNamespace(score=0.8, payload={"text": "A", "source_document": "sla-delivery", "section": "SLA"}),
        SimpleNamespace(score=0.4, payload={"text": "B", "source_document": "returns-policy", "section": "Returns"}),
        SimpleNamespace(score=0.3, payload={"text": "C", "source_document": "storage-pricing", "section": "Pricing"}),
    ]

    results = rag.retrieve("¿Cuál es el SLA?", k=2, min_score=0.4, client=client)

    assert [item["text"] for item in results] == ["A", "B"]
    assert len(results) <= 2


def test_query_composes_retrieve_and_generate_answer(monkeypatch):
    context = [{"text": "30 días", "source_document": "returns-policy", "section": "Devoluciones"}]
    monkeypatch.setattr(rag, "retrieve", lambda *args, **kwargs: context)
    monkeypatch.setattr(rag, "generate_answer", lambda question, retrieved: "30 días.")

    result = rag.query("¿Cuánto dura la ventana?")

    assert result["answer"] == "30 días."
    assert result["sources"] == [{"source_document": "returns-policy", "section": "Devoluciones"}]
    assert result["abstained"] is False


def test_query_abstains_without_hits_and_skips_generation(monkeypatch):
    monkeypatch.setattr(rag, "retrieve", lambda *args, **kwargs: [])
    monkeypatch.setattr(
        rag,
        "generate_answer",
        lambda *args, **kwargs: pytest.fail("No debe llamar al generador sin contexto"),
    )

    result = rag.query("¿Cuánto cuesta un descuento?")

    assert result["sources"] == []
    assert result["abstained"] is True
    assert "información suficiente" in result["answer"]


def test_generate_answer_uses_context_and_business_rules(monkeypatch):
    configure_models(monkeypatch)
    import litellm

    captured = {}

    def completion(**kwargs):
        captured.update(kwargs)
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="El SLA estándar es de 3 a 5 días hábiles."))]
        )

    monkeypatch.setattr(litellm, "completion", completion)
    answer = rag.generate_answer(
        "¿Cuál es el SLA estándar?",
        [{"source_document": "sla-delivery", "section": "SLA", "text": "3 a 5 días hábiles"}],
    )

    system_prompt = captured["messages"][0]["content"]
    user_prompt = captured["messages"][1]["content"]
    assert answer == "El SLA estándar es de 3 a 5 días hábiles."
    assert "Black Friday" in system_prompt
    assert "Miguel Torres" in system_prompt
    assert "Carlos Vega" in system_prompt
    assert "3 a 5 días hábiles" in user_prompt


def test_eval_dataset_covers_all_sources_and_peak_demand():
    dataset = json.loads(EVAL_FILE.read_text(encoding="utf-8"))["queries"]

    assert len(dataset) >= 8
    assert {item["expected_source_document"] for item in dataset} == {
        "sla-delivery", "returns-policy", "carrier-coverage", "storage-pricing"
    }
    assert any("black friday" in item["question"].casefold() for item in dataset)


def test_eval_counts_correct_expected_chunk_within_top_three():
    query = {
        "question": "¿Qué plazo?",
        "expected_source_document": "sla-delivery",
        "expected_section": "SLA de Entrega",
        "expected_text": "3 a 5 días hábiles",
    }
    hits = [
        {"source_document": "returns-policy", "section": "Política", "text": "Otro contenido"},
        {"source_document": "sla-delivery", "section": "SLA de Entrega", "text": "Envío estándar: 3 a 5 días hábiles"},
    ]

    result = evaluate_queries([query], retrieve_fn=lambda *args, **kwargs: hits)

    assert result["recall_at_3"] == 1.0
    assert result["passed"] is True