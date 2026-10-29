# RAG comercial de TrackFlow

## Alcance

El asistente ayuda al equipo de account managers y business development a responder preguntas de marcas durante conversaciones comerciales. La API requiere un usuario activo autenticado del backoffice. El corpus compartido se limita a los cuatro Markdown de `docs/company-knowledge-base/`; no se incorporan datos de pedidos, clientes ni fuentes externas.

Qdrant se ejecuta en `docker-compose.yml` para desarrollo, con colección `trackflow_knowledge` y volumen persistente independiente. No se añade Qdrant a producción en este hito. LiteLLM recibe la configuración del backend mediante `LITELLM_API_KEY`, `LITELLM_API_BASE`, `RAG_EMBEDDING_MODEL` y `RAG_LLM_MODEL`. El modelo de embeddings debe ser distinto del modelo generativo. No poner estas variables en código cliente ni registrar sus valores.

En entornos Linux donde Docker bridge no puede resolver DNS externo, se puede usar el override `docker-compose.rag-host.yml`. Este mantiene Qdrant enlazado solo a loopback, ejecuta la API en la red del host y enruta el backoffice a través de `host.docker.internal`:

```bash
docker compose -f docker-compose.yml -f docker-compose.rag-host.yml up --build
```

Este override es solo para desarrollo local; no usarlo en producción ni en plataformas que no soporten `network_mode: host`.

## Pipeline

`setup()` lee la carpeta canónica, valida los cuatro documentos y los indexa. `embed()` crea vectores y puntos Qdrant. `retrieve()` calcula el embedding de la consulta y devuelve hasta tres resultados que superen el umbral. `generate_answer()` genera texto comercial solo con esos fragmentos. `query()` compone recuperación y generación; sin resultados suficientes devuelve una abstención sin invocar el LLM. El endpoint solo valida, autentica y delega en este pipeline.

Para indexar explícitamente desde el entorno donde están montados el corpus y Qdrant:

```bash
python -m data.pipelines.setup_rag
```

## Chunking y payload

Los cuatro documentos son Markdown breves. El chunker conserva como unidades semánticas los párrafos y las listas contiguas; los encabezados se guardan como jerarquía `section` y se anteponen al texto del chunk para que el embedding retenga su contexto. No divide párrafos ni listas por longitud, porque cortar condiciones tarifarias, excepciones o secuencias operativas a mitad de idea sería más dañino que permitir un fragmento algo mayor. `chunk_index` sigue el orden fuente. `setup()` exige al menos tres chunks por documento.

Cada punto usa UUID y vector, con payload: `company=trackflow`, `source_document` (slug estable: `sla-delivery`, `returns-policy`, `carrier-coverage` o `storage-pricing`), `section`, `language=es`, `chunk_index` y `text`. La respuesta conserva y presenta documento/sección como fuente breve.

## Embeddings, similitud y evaluación

El embedding de documentos y consultas usa exclusivamente `RAG_EMBEDDING_MODEL`; `RAG_LLM_MODEL` solo genera respuestas. La distancia de colección es coseno. El umbral inicial es `min_score=0.35`: es una configuración conservadora para el corpus pequeño y consultas en español, no un KPI del negocio; se debe revisar mediante `data/eval/test-queries.json` antes de cambiarlo. `retrieve()` aplica el umbral en Qdrant y vuelve a comprobarlo localmente, por lo que puede retornar menos de `k` resultados o ninguno.

El dataset contiene diez preguntas, resultados esperados por documento/sección y un fragmento esperado, incluyendo una pregunta de Black Friday. `python -m data.eval.evaluate_rag` reindexa el corpus, evalúa Recall@3 y falla si queda por debajo de 80%. Este número mide aciertos de chunk esperado entre los tres primeros, no calidad de generación. La generación debe mantener faithfulness: tarifas, porcentajes y plazos no pueden apartarse del contexto recuperado.

## Reglas de respuesta

- Responder en español, como vendedor de TrackFlow, con tono claro y profesional para una marca.
- Usar solo el contexto recuperado y mostrar documento/sección fuera del texto generado.
- Si no hay contexto por encima de `min_score`, decir explícitamente que no hay información suficiente.
- No prometer SLA durante Black Friday, Navidad o Rebajas de enero.
- Las devoluciones internacionales requieren gestión manual; no describirlas como automáticas.
- Los descuentos de almacenamiento requieren aprobación de Miguel Torres.
- Las excepciones de transportista requieren aprobación de Carlos Vega.

## Límites operativos

La indexación es explícita y no ocurre durante import/startup de FastAPI. Los tests unitarios sustituyen Qdrant y LiteLLM por mocks; no requieren servicios externos. La imagen de producción no incluye Qdrant, por lo que el endpoint responde 503 si el pipeline no está disponible en ese despliegue. El Compose de desarrollo monta el código `data/` y el corpus como solo lectura.