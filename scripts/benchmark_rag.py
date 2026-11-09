"""Read-only RAG timings; run: python -m scripts.benchmark_rag --rounds 2.

Uses configured services (billable model calls), never indexes or writes data.
Prints JSON lines without credentials, model endpoints, or generated answers.
"""
from __future__ import annotations

import argparse
import asyncio
import faulthandler
import json
from time import perf_counter
from unittest.mock import patch


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rounds", type=int, default=2)
    parser.add_argument("--question", choices=("returns", "rural", "storage"))
    parser.add_argument("--trace-slow", action="store_true", help="Dump Python stacks every 15 seconds while a query is pending")
    parser.add_argument("--trace-http", action="store_true", help="Print HTTP attempt durations and effective timeouts without URLs or headers")
    args = parser.parse_args()
    if not 1 <= args.rounds <= 10:
        parser.error("--rounds must be between 1 and 10")

    started = perf_counter()
    import httpx
    from data.pipelines import rag

    print(json.dumps({"event": "imports", "seconds": round(perf_counter() - started, 4)}), flush=True)
    started = perf_counter()
    client = rag._cached_qdrant_client()
    collection = client.get_collection(rag.COLLECTION_NAME)
    client.close()
    print(json.dumps({"event": "qdrant_init", "seconds": round(perf_counter() - started, 4),
                      "points": collection.points_count}), flush=True)

    questions = [
        ("returns", "¿Cuál es la ventana estándar para solicitar una devolución?"),
        ("rural", "¿Qué transportista tiene mejor cobertura rural en Aragón?"),
        ("storage", "¿Cuál es la tarifa de almacenamiento mensual en Los Ángeles?"),
    ]
    original_request = rag.request_model
    original_search = rag._search
    original_send = httpx.AsyncClient.send
    failures = 0

    for round_index in range(1, args.rounds + 1):
        for label, question in questions:
            if args.question and label != args.question:
                continue
            row = {"event": "query", "round": round_index, "question_id": label,
                   "embedding_s": 0, "generation_s": 0, "qdrant_s": 0,
                   "embedding_calls": 0, "generation_calls": 0}

            async def send(http_client, request, *call_args, **kwargs):
                start = perf_counter()
                event = {"event": "http", "question_id": label, "timeout": request.extensions.get("timeout")}
                try:
                    response = await original_send(http_client, request, *call_args, **kwargs)
                    event["status"] = response.status_code
                    return response
                except asyncio.CancelledError:
                    event["cancelled"] = True
                    raise
                except Exception as error:
                    event["error_type"] = type(error).__name__
                    raise
                finally:
                    if args.trace_http:
                        event["seconds"] = round(perf_counter() - start, 4)
                        print(json.dumps(event), flush=True)

            def timed(name, function, *call_args, **kwargs):
                start = perf_counter()
                try:
                    return function(*call_args, **kwargs)
                finally:
                    row[name] = round(perf_counter() - start, 4)

            async def search(*call_args, **kwargs):
                start = perf_counter()
                try:
                    return await original_search(*call_args, **kwargs)
                finally:
                    row["qdrant_s"] = round(perf_counter() - start, 4)

            def request(settings, route, payload, timeout):
                stage = "embedding" if route == "/embeddings" else "generation"
                row[stage + "_calls"] += 1
                response = timed(stage + "_s", original_request, settings, route, payload, timeout)
                usage = response.get("usage", {})
                if stage == "generation":
                    for key in ("prompt_tokens", "completion_tokens", "total_tokens"):
                        row[key] = usage.get(key)
                    row["reasoning_tokens"] = (usage.get("completion_tokens_details") or {}).get("reasoning_tokens")
                return response

            started = perf_counter()
            if args.trace_slow:
                faulthandler.dump_traceback_later(15, repeat=True)
            try:
                with patch.object(rag, "request_model", request), patch.object(rag, "_search", search), patch.object(httpx.AsyncClient, "send", send):
                    result = rag.query(question)
                row.update(ok=True, retrieved_count=result["retrieved_count"],
                           abstained=result["abstained"], answer_chars=len(result["answer"]))
            except Exception as error:
                # Error messages from SDKs may contain private endpoint details.
                row.update(ok=False, error_type=type(error).__name__)
                failures += 1
            finally:
                if args.trace_slow:
                    faulthandler.cancel_dump_traceback_later()
            row["total_s"] = round(perf_counter() - started, 4)
            print(json.dumps(row), flush=True)
    return int(failures > 0)


if __name__ == "__main__":
    raise SystemExit(main())
