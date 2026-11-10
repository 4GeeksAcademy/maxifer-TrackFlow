import pytest
from qdrant_client import QdrantClient

from data.pipelines import production_rag as production, rag


@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setenv("LITELLM_API_BASE", "http://gateway.test")
    monkeypatch.setenv("LITELLM_API_KEY", "synthetic")
    monkeypatch.setenv("RAG_EMBEDDING_MODEL", "embedding")
    monkeypatch.setenv("RAG_LLM_MODEL", "chat")
    monkeypatch.setenv("RAG_COLLECTION_NAME", "trackflow_knowledge_prod")
    monkeypatch.setattr(rag, "_embed_texts", lambda texts: [[1.0, 0.0] for _ in texts])
    client = QdrantClient(":memory:")
    try:
        yield client
    finally:
        client.close()


def test_initial_prepare_reuse_and_first_release_rollback(configured, monkeypatch):
    first = production.prepare(configured)
    assert first["previous"] is None and not first["reused"]
    assert first["documents"] == 4 and first["chunks"] == 20
    assert production.alias_target(configured, first["alias"]) is None
    production.publish(configured, first)
    assert production.alias_target(configured, first["alias"]) == first["candidate"]
    monkeypatch.setattr(rag, "_embed_texts", lambda _: pytest.fail("Must reuse embeddings"))
    second = production.prepare(configured)
    assert second["reused"] and second["candidate"] == first["candidate"]
    production.publish(configured, first, restore=True)
    assert production.alias_target(configured, first["alias"]) is None
    assert configured.collection_exists(first["candidate"])


def test_model_change_builds_new_collection_and_restores_previous(configured, monkeypatch):
    first = production.prepare(configured)
    production.publish(configured, first)
    monkeypatch.setenv("RAG_EMBEDDING_MODEL", "new-embedding")
    second = production.prepare(configured)
    assert second["previous"] == first["candidate"]
    assert second["candidate"] != first["candidate"]
    assert production.alias_target(configured, first["alias"]) == first["candidate"]
    production.publish(configured, second)
    production.publish(configured, second, restore=True)
    assert production.alias_target(configured, first["alias"]) == first["candidate"]


def test_fingerprint_includes_corpus_processing_gateway_and_embedding_but_not_key(configured, monkeypatch):
    chunks = [{"text": "original"}]
    settings = rag._settings()
    original = production.fingerprint(chunks, settings)
    assert production.fingerprint([{"text": "changed"}], settings) != original
    for key in ["embedding_model", "api_base"]:
        assert production.fingerprint(chunks, settings | {key: "changed"}) != original
    assert production.fingerprint(chunks, settings | {"api_key": "rotated", "llm_model": "new-chat"}) == original
    monkeypatch.setattr(production, "INDEX_VERSION", "v2")
    assert production.fingerprint(chunks, settings) != original


def test_incomplete_collection_is_retained_and_rebuilt(configured):
    first = production.prepare(configured)
    points, _ = configured.scroll(first["candidate"])
    configured.delete(first["candidate"], points_selector=[points[0].id], wait=True)
    second = production.prepare(configured)
    assert not second["reused"] and second["candidate"] != first["candidate"]
    assert configured.collection_exists(first["candidate"])


def test_corpus_change_builds_new_index_without_publishing_it(configured, monkeypatch):
    first = production.prepare(configured)
    production.publish(configured, first)
    chunks = production.load_corpus_chunks(rag.DEFAULT_CORPUS_DIR)
    chunks[0]["text"] += " Cambio sintético para la prueba."
    monkeypatch.setattr(production, "load_corpus_chunks", lambda _: chunks)
    second = production.prepare(configured)
    assert second["candidate"] != first["candidate"]
    assert second["fingerprint"] != first["fingerprint"]
    assert production.alias_target(configured, first["alias"]) == first["candidate"]


@pytest.mark.parametrize("failure", ["embedding", "qdrant", "dimensions"])
def test_preparation_failure_preserves_active_alias(configured, monkeypatch, failure):
    first = production.prepare(configured)
    production.publish(configured, first)
    monkeypatch.setenv("RAG_EMBEDDING_MODEL", "new-model")
    def fail(*args, **kwargs):
        raise RuntimeError("synthetic failure")
    if failure == "embedding":
        monkeypatch.setattr(rag, "_embed_texts", fail)
    elif failure == "qdrant":
        monkeypatch.setattr(configured, "upsert", fail)
    else:
        monkeypatch.setattr(rag, "_embed_texts", lambda texts: [[1.0]] + [[1.0, 0.0] for _ in texts[1:]])
    with pytest.raises((RuntimeError, ValueError)):
        production.prepare(configured)
    assert production.alias_target(configured, first["alias"]) == first["candidate"]


def test_destructive_setup_rejected_for_production_alias(configured):
    with pytest.raises(rag.RAGConfigurationError, match="production_rag"):
        rag.setup(client=configured)


def test_payload_corruption_is_not_reused(configured):
    first = production.prepare(configured)
    points, _ = configured.scroll(first["candidate"])
    configured.set_payload(first["candidate"], payload={"text": "corrupted"}, points=[points[0].id])
    assert production.prepare(configured)["candidate"] != first["candidate"]


def test_collection_override_used_by_retrieval(configured):
    state = production.prepare(configured)
    production.publish(configured, state)
    assert rag.retrieve("Consulta", client=configured)


def test_cli_failure_does_not_print_provider_secrets(configured, monkeypatch, capsys):
    monkeypatch.setattr("sys.argv", ["production_rag", "prepare"])
    monkeypatch.setattr(production, "prepare", lambda *_: (_ for _ in ()).throw(RuntimeError("synthetic-secret")))
    # The local client avoids opening a real connection.
    monkeypatch.setattr(production, "QdrantClient", lambda **_: configured)
    with pytest.raises(SystemExit):
        production.main()
    captured = capsys.readouterr()
    assert "synthetic-secret" not in captured.err + captured.out
