from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Callable

from data.pipelines.rag import DEFAULT_K, DEFAULT_MIN_SCORE, retrieve, setup


EVAL_FILE = Path(__file__).with_name("test-queries.json")
RECALL_AT_3_THRESHOLD = 0.8


def evaluate_queries(
    queries: list[dict[str, str]],
    *,
    retrieve_fn: Callable[..., list[dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    retrieve_fn = retrieve_fn or retrieve
    correct = 0
    results = []
    for query_item in queries:
        hits = retrieve_fn(
            query_item["question"], k=DEFAULT_K, min_score=DEFAULT_MIN_SCORE
        )
        expected_source = query_item["expected_source_document"]
        expected_section = query_item["expected_section"]
        expected_text = query_item["expected_text"].casefold()
        hit = any(
            item.get("source_document") == expected_source
            and item.get("section") == expected_section
            and expected_text in str(item.get("text", "")).casefold()
            for item in hits[:DEFAULT_K]
        )
        correct += int(hit)
        results.append({"question": query_item["question"], "hit": hit})

    recall = correct / len(queries) if queries else 0.0
    return {
        "metric": "Recall@3",
        "recall_at_3": recall,
        "threshold": RECALL_AT_3_THRESHOLD,
        "passed": bool(queries) and recall >= RECALL_AT_3_THRESHOLD,
        "queries": results,
    }


def main() -> int:
    dataset = json.loads(EVAL_FILE.read_text(encoding="utf-8"))["queries"]
    setup()
    result = evaluate_queries(dataset)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())