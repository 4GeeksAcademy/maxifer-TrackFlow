# Carpeta `data/pipelines`

El pipeline implementado alimenta el asistente comercial RAG. Lee el corpus
Markdown de [docs/company-knowledge-base](../../docs/company-knowledge-base), lo
fragmenta con `data/process/rag.py`, indexa embeddings en Qdrant y genera respuestas
mediante un gateway LiteLLM compatible con OpenAI.

English version: [README.md](./README.md).

## Módulos

| Módulo | Responsabilidad |
| --- | --- |
| `rag.py` | Indexación de desarrollo, recuperación y respuestas con fuentes |
| `rag_runtime.py` | Transporte HTTPX asíncrono, presupuestos de tiempo y cachés por proceso |
| `setup_rag.py` | Entrada de indexación para desarrollo |
| `production_rag.py` | Índices inmutables y activación/restauración atómica del alias de producción |

## Preparación local

Usa Python 3.12+ y ejecuta `uv sync --frozen` desde la raíz. Inicia Qdrant y exporta
`LITELLM_API_BASE`, `LITELLM_API_KEY`, `RAG_EMBEDDING_MODEL` y `RAG_LLM_MODEL` en
el entorno del proceso. Los aliases de los dos modelos deben ser distintos.
`QDRANT_URL` usa `http://localhost:6333` por defecto; `RAG_COLLECTION_NAME` usa
`trackflow_knowledge`. La entrada independiente lee variables de entorno;
no carga automáticamente el `.env` de la API.

Desde la raíz, indexa el corpus de desarrollo:

```sh
uv run --frozen python -m data.pipelines.setup_rag
```

Para el stack Compose local ya configurado, usa en su lugar:

```sh
docker compose exec services python -m data.pipelines.setup_rag
```

La indexación llama al proveedor de embeddings y puede tener coste. Reemplaza la
colección de desarrollo; repítela si cambia el corpus o el modelo de embeddings.
Mantén almacenamiento separado para desarrollo y producción. El índice persiste
en Qdrant.

## Consultas y producción

El backoffice `/assistant` usa `POST /api/rag/query` autenticado y recibe
`{"question": "..."}`. Qdrant se consulta en cada pregunta. Los embeddings se
cachean 15 minutos y las respuestas 5 minutos, con 256 entradas por proceso en
cada caché; las respuestas dependen del contexto recuperado actual. La consulta
tiene un presupuesto global de 30 segundos y no reintenta localmente al proveedor.

Producción prepara un índice inmutable y activa `trackflow_knowledge_prod` durante
la pausa de la API. El rollback restaura el alias anterior. Consulta la
[guía Docker](../../docs/docker.md) y la [guía de Actions](../../docs/github-actions.md)
para ese flujo; no uses la indexación de desarrollo contra producción.

Diseño: [RAG](../../docs/rag/rag-design.md). Validación desde la raíz:
`uv run --frozen pytest -q`, con almacenamiento aislado y servicios externos sintéticos.
