# `data/pipelines` folder

The implemented pipeline powers the commercial RAG assistant. It reads the Markdown
corpus in [docs/company-knowledge-base](../../docs/company-knowledge-base), chunks it
with `data/process/rag.py`, indexes embeddings in Qdrant and generates answers
through an OpenAI-compatible LiteLLM gateway.

## Modules

| Module | Responsibility |
| --- | --- |
| `rag.py` | Development indexing, retrieval and answers with sources |
| `rag_runtime.py` | Asynchronous HTTPX transport, time budgets and process-local caches |
| `setup_rag.py` | Development indexing entry point |
| `production_rag.py` | Immutable indexes and atomic production alias activation/restoration |

## Local setup

Use Python 3.12+ and run `uv sync --frozen` from the repository root. Start Qdrant
and export `LITELLM_API_BASE`, `LITELLM_API_KEY`, `RAG_EMBEDDING_MODEL` and
`RAG_LLM_MODEL` in the process environment. The model aliases must differ.
`QDRANT_URL` defaults to `http://localhost:6333`; `RAG_COLLECTION_NAME` defaults
to `trackflow_knowledge`. The standalone entry point reads environment variables;
it does not load the API's `.env` automatically.

From the repository root, index the development corpus:

```sh
uv run --frozen python -m data.pipelines.setup_rag
```

For a configured local Compose stack, use instead:

```sh
docker compose exec services python -m data.pipelines.setup_rag
```

Indexing calls the embedding provider and may incur charges. It replaces the
development collection; repeat after changing the corpus or embedding model.
Keep development storage separate from production. Indexes persist in Qdrant.

## Queries and production

The backoffice `/assistant` uses authenticated `POST /api/rag/query`, with
`{"question": "..."}`. Qdrant is searched on every question. Embeddings are cached
for 15 minutes and answers for 5 minutes, with 256 entries per process in each
cache; answers depend on the current retrieved context. Queries have a 30-second
overall budget and no local provider retries.

Production prepares an immutable index, then activates `trackflow_knowledge_prod`
during the API pause. Rollback restores the previous alias. Follow the
[Docker guide](../../docs/docker.md) and [Actions guide](../../docs/github-actions.md)
for this workflow; do not use development indexing against production.

Design: [RAG](../../docs/rag/rag-design.md). Validation from the repository root:
`uv run --frozen pytest -q`, using isolated storage and synthetic external services.

> _Spanish version: [README.es.md](./README.es.md)._
