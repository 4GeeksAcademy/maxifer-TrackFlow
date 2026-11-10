import asyncio
from types import SimpleNamespace

import httpx
import pytest

from data.pipelines import rag, rag_runtime as runtime


@pytest.fixture(autouse=True)
def isolated_settings(monkeypatch):
    for key, value in {
        "LITELLM_API_BASE": "https://gateway.test/v1",
        "LITELLM_API_KEY": "synthetic-key",
        "RAG_EMBEDDING_MODEL": "litellm/assigned-embedding",
        "RAG_LLM_MODEL": "litellm/assigned-chat",
    }.items():
        monkeypatch.setenv(key, value)
    runtime.embedding_cache.clear()
    runtime.answer_cache.clear()
    yield
    runtime.embedding_cache.clear()
    runtime.answer_cache.clear()


def test_cache_expires_evicts_and_does_not_share_mutable_values(monkeypatch):
    clock = [0.0]
    monkeypatch.setattr(runtime, "monotonic", lambda: clock[0])
    cache = runtime.TTLCache(maxsize=2, ttl=10)
    value = [1]
    cache.put("a", value)
    value.append(2)
    assert cache.get("a") == [1]
    cache.get("a").append(3)
    assert cache.get("a") == [1]
    cache.put("b", [2])
    cache.get("a")
    cache.put("c", [3])
    assert cache.get("b") is None
    clock[0] = 10
    assert cache.get("a") is None
    assert cache.get("c") is None


def test_embedding_response_is_reordered_and_batches_keep_indexing_budget(monkeypatch):
    def request(settings, route, payload, timeout):
        assert timeout == 45
        assert payload["encoding_format"] == "float"
        return {"data": [{"index": 1, "embedding": [2]}, {"index": 0, "embedding": [1]}]}

    monkeypatch.setattr(rag, "request_model", request)
    assert rag._embed_texts(["primero", "segundo"]) == [[1.0], [2.0]]


def test_repeated_question_skips_models_but_checks_current_index(monkeypatch):
    calls = []

    def request(settings, route, payload, timeout):
        calls.append((route, payload["model"]))
        if route == "/embeddings":
            return {"data": [{"index": 0, "embedding": [1, 0]}]}
        return {"choices": [{"message": {"content": "Respuesta verificada"}}]}

    monkeypatch.setattr(rag, "request_model", request)

    class Index:
        text = "30 días"
        searches = 0

        def query_points(self, **kwargs):
            self.searches += 1
            return SimpleNamespace(points=[SimpleNamespace(score=.9, payload={
                "source_document": "returns-policy", "section": "Ventana", "text": self.text,
            })])

    index = Index()
    first = rag.query("¿Plazo?", client=index)
    first["sources"].clear()
    second = rag.query("¿Plazo?", client=index)
    assert second["sources"]
    assert calls == [("/embeddings", "assigned-embedding"), ("/chat/completions", "assigned-chat")]
    assert index.searches == 2
    index.text = "Ventana actualizada"
    rag.query("¿Plazo?", client=index)
    assert len(calls) == 3
    monkeypatch.setenv("RAG_LLM_MODEL", "same-alias-new-config")
    rag.query("¿Plazo?", client=index)
    assert len(calls) == 4
    monkeypatch.setenv("RAG_EMBEDDING_MODEL", "changed-embedding")
    rag.query("¿Plazo?", client=index)
    assert len(calls) == 6
    monkeypatch.setenv("LITELLM_API_KEY", "other-synthetic-key")
    rag.query("¿Plazo?", client=index)
    assert len(calls) == 8


@pytest.mark.parametrize("status", [429, 500, 503])
def test_http_errors_make_exactly_one_attempt(monkeypatch, status):
    attempts = []

    async def handler(request):
        attempts.append(request)
        return httpx.Response(status, json={"error": "synthetic"})

    monkeypatch.setattr(runtime.httpx, "AsyncHTTPTransport", lambda **kwargs: httpx.MockTransport(handler))
    with pytest.raises(httpx.HTTPStatusError):
        runtime.request_model(rag._settings(), "/embeddings", {"model": "assigned"}, 1)
    assert len(attempts) == 1
    assert str(attempts[0].url) == "https://gateway.test/v1/embeddings"
    assert attempts[0].headers["authorization"] == "Bearer synthetic-key"


def test_deadline_cancels_real_socket_without_retry(monkeypatch):
    async def scenario():
        disconnected = asyncio.Event()
        attempts = []

        async def slow_server(reader, writer):
            try:
                headers = await reader.readuntil(b"\r\n\r\n")
                length = next(int(line.split(b":", 1)[1]) for line in headers.split(b"\r\n")
                              if line.lower().startswith(b"content-length:"))
                await reader.readexactly(length)
                attempts.append(1)
                # Client must disconnect when cancelled, even without any response.
                assert await reader.read() == b""
            finally:
                writer.close()
                await writer.wait_closed()
                disconnected.set()

        server = await asyncio.start_server(slow_server, "127.0.0.1", 0)
        async with server:
            port = server.sockets[0].getsockname()[1]
            settings = {"api_base": f"http://127.0.0.1:{port}", "api_key": "synthetic"}
            # Prepare TLS configuration before the short test deadline: on
            # Windows certificate loading can exceed a fraction of a second.
            transport = httpx.AsyncHTTPTransport(retries=0)
            monkeypatch.setattr(runtime.httpx, "AsyncHTTPTransport", lambda **kwargs: transport)
            token = runtime.deadline.set(runtime.monotonic() + .5)
            start = runtime.monotonic()
            try:
                with pytest.raises(runtime.RAGRequestTimeout):
                    await runtime._request_model(settings, "/embeddings", {}, 5)
            finally:
                runtime.deadline.reset(token)
            assert runtime.monotonic() - start < 3
            await asyncio.wait_for(disconnected.wait(), 3)
            assert len(attempts) == 1

    asyncio.run(scenario())


def test_failed_or_truncated_generations_are_not_cached(monkeypatch):
    context = [{"text": "30 días", "source_document": "returns-policy", "section": "Ventana"}]
    responses = [runtime.RAGRequestTimeout(), {"choices": [{"finish_reason": "length", "message": {"content": "Cortada"}}]},
                 {"choices": [{"message": {"content": "Completa"}}]}]

    def request(*args):
        response = responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response

    monkeypatch.setattr(rag, "request_model", request)
    with pytest.raises(rag.RAGUnavailableError, match="tardó demasiado"):
        rag.generate_answer("¿Plazo?", context)
    with pytest.raises(rag.RAGUnavailableError):
        rag.generate_answer("¿Plazo?", context)
    assert rag.generate_answer("¿Plazo?", context) == "Completa"
    assert rag.generate_answer("¿Plazo?", context) == "Completa"


def test_whole_query_uses_remaining_budget_and_restores_context(monkeypatch):
    clock = [0.0]
    monkeypatch.setattr(rag, "monotonic", lambda: clock[0])
    monkeypatch.setattr(runtime, "monotonic", lambda: clock[0])

    def retrieve(*args, **kwargs):
        assert runtime.remaining_timeout(100) == 30
        clock[0] += 12
        return [{"text": "Contexto"}]

    def generate(*args):
        assert runtime.remaining_timeout(20) == 18
        clock[0] += 19
        runtime.remaining_timeout(20)

    monkeypatch.setattr(rag, "retrieve", retrieve)
    monkeypatch.setattr(rag, "generate_answer", generate)
    assert runtime.deadline.get() is None
    with pytest.raises(rag.RAGUnavailableError, match="tardó demasiado"):
        rag.query("¿Plazo?")
    assert runtime.deadline.get() is None


def test_qdrant_deadline_cancels_and_closes_client(monkeypatch):
    events = []

    class SlowQdrant:
        def __init__(self, **kwargs):
            pass

        async def query_points(self, **kwargs):
            try:
                await asyncio.sleep(10)
            except asyncio.CancelledError:
                events.append("cancelled")
                raise

        async def close(self):
            events.append("closed")

    monkeypatch.setattr(rag, "AsyncQdrantClient", SlowQdrant)
    monkeypatch.setattr(rag, "SEARCH_TIMEOUT_SECONDS", .01)
    with pytest.raises(TimeoutError):
        asyncio.run(rag._search([1, 0], 3, .35))
    assert events == ["cancelled", "closed"]
