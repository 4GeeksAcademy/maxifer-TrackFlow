# Build from the repository root: API imports packages/ and scripts/.
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir uv==0.12.12
COPY services/requirements.txt ./requirements.txt
RUN uv pip install --system --no-cache -r requirements.txt
COPY services ./services
COPY packages ./packages
COPY scripts/seed_incidents.py scripts/incidents-trackflow.csv ./scripts/
RUN mkdir -p services/api/data
EXPOSE 8000

FROM base AS development
CMD ["uvicorn", "services.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "services", "--reload-dir", "packages", "--reload-dir", "scripts"]

FROM base AS production
RUN useradd --create-home app && chown -R app:app /app
USER app
# Single worker: the existing API uses TinyDB and in-process analysis state.
CMD ["uvicorn", "services.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
