"""Bounded, process-local RAG caches and cancellable model requests."""
from __future__ import annotations

import asyncio
from collections import OrderedDict
from contextvars import ContextVar
from copy import deepcopy
import hashlib
import json
from threading import Lock
from time import monotonic
from typing import Any

import httpx


QUERY_TIMEOUT_SECONDS = 30
EMBEDDING_TIMEOUT_SECONDS = 10
GENERATION_TIMEOUT_SECONDS = 20
SEARCH_TIMEOUT_SECONDS = 5
deadline: ContextVar[float | None] = ContextVar("rag_deadline", default=None)


class RAGRequestTimeout(TimeoutError):
    pass


def remaining_timeout(stage_limit: float) -> float:
    end = deadline.get()
    remaining = min(stage_limit, end - monotonic()) if end is not None else stage_limit
    if remaining <= 0:
        raise RAGRequestTimeout("Se agotó el tiempo de consulta")
    return remaining


class TTLCache:
    def __init__(self, maxsize: int = 256, ttl: float = 900):
        self.maxsize = maxsize
        self.ttl = ttl
        self._items: OrderedDict[str, tuple[float, Any]] = OrderedDict()
        self._lock = Lock()

    def get(self, key: str) -> Any:
        with self._lock:
            item = self._items.get(key)
            if item is None:
                return None
            expires, value = item
            if expires <= monotonic():
                del self._items[key]
                return None
            self._items.move_to_end(key)
            return deepcopy(value)

    def put(self, key: str, value: Any) -> None:
        with self._lock:
            self._items[key] = (monotonic() + self.ttl, deepcopy(value))
            self._items.move_to_end(key)
            while len(self._items) > self.maxsize:
                self._items.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._items.clear()


embedding_cache = TTLCache()
answer_cache = TTLCache(ttl=300)


def cache_key(*parts: Any) -> str:
    # Hash configuration too: private credentials/endpoints never become log keys.
    return hashlib.sha256(json.dumps(parts, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


async def _request_model(settings: dict[str, str], route: str, payload: dict, timeout: float) -> dict:
    try:
        # asyncio.timeout covers the whole exchange, including connection and body.
        # Cancellation closes the transport; no detached request thread remains.
        async with asyncio.timeout(remaining_timeout(timeout)):
            async with httpx.AsyncClient(
                transport=httpx.AsyncHTTPTransport(retries=0),
                timeout=timeout,
                follow_redirects=False,
            ) as client:
                response = await client.post(
                    settings["api_base"].rstrip("/") + route,
                    headers={"Authorization": "Bearer " + settings["api_key"]},
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
    except (TimeoutError, httpx.TimeoutException) as error:
        raise RAGRequestTimeout("Se agotó el tiempo de espera del modelo") from error


def request_model(settings: dict[str, str], route: str, payload: dict, timeout: float) -> dict:
    # Public pipeline and FastAPI route are synchronous and run in worker threads.
    return asyncio.run(_request_model(settings, route, payload, timeout))
