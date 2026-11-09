"""Prepare immutable production indices and publish/restore their alias.

Only JSON deployment state is printed; exceptions never expose provider details.
The deployment lock serializes preparation, activation and rollback.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import sys
from contextlib import closing
from pathlib import Path
from time import monotonic
from uuid import NAMESPACE_URL, uuid4, uuid5

from qdrant_client import QdrantClient, models

from data.pipelines import rag
from data.process.rag import load_corpus_chunks


INDEX_VERSION = "semantic-chunks-v1"


def fingerprint(chunks, settings):
    content = json.dumps({
        "version": INDEX_VERSION, "chunks": chunks,
        "gateway": settings["api_base"].rstrip("/"),
        "embedding_model": settings["embedding_model"].removeprefix("litellm/"),
    }, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(content.encode()).hexdigest()


def alias_target(client, alias):
    return next((item.collection_name for item in client.get_aliases().aliases
                 if item.alias_name == alias), None)


def validate_index(client, name, chunks, digest):
    """Compare every stored point, including dimensions and corpus coverage."""
    config = client.get_collection(name).config.params.vectors
    if isinstance(config, dict) or config.size < 1 or config.distance != models.Distance.COSINE:
        raise ValueError("Invalid index vector configuration")
    expected = {str(uuid5(NAMESPACE_URL, json.dumps(chunk, sort_keys=True, ensure_ascii=False))): chunk
                for chunk in chunks}
    found = set()
    offset = None
    while True:
        points, offset = client.scroll(name, limit=128, offset=offset,
                                       with_payload=True, with_vectors=True)
        for point in points:
            payload = dict(point.payload or {})
            if payload.pop("_rag_fingerprint", None) != digest:
                raise ValueError("Invalid index fingerprint")
            if str(point.id) in found or expected.get(str(point.id)) != payload:
                raise ValueError("Index does not match corpus")
            vector = point.vector
            if not isinstance(vector, list) or len(vector) != config.size or not all(math.isfinite(v) for v in vector):
                raise ValueError("Invalid index vectors")
            found.add(str(point.id))
        if offset is None:
            break
    if found != expected.keys() or client.count(name, exact=True).count != len(expected):
        raise ValueError("Incomplete index")


def prepare(client, corpus_dir=rag.DEFAULT_CORPUS_DIR):
    settings = rag._settings()
    alias = rag.collection_name()
    # Production must never turn the legacy, concrete development collection into an alias.
    if alias == rag.COLLECTION_NAME or client.collection_exists(alias) and alias_target(client, alias) is None:
        raise ValueError("Production requires a dedicated alias")
    chunks = load_corpus_chunks(Path(corpus_dir))
    digest = fingerprint(chunks, settings)
    prefix = f"{alias}_{digest}"
    previous = alias_target(client, alias)
    candidate = None
    for item in client.get_collections().collections:
        if item.name.startswith(prefix + "_"):
            try:
                validate_index(client, item.name, chunks, digest)
            except ValueError:
                continue
            candidate = item.name
            break
    reused = candidate is not None
    if candidate is None:
        vectors = rag._embed_texts([str(chunk["text"]) for chunk in chunks])
        size = len(vectors[0]) if vectors else 0
        if not size or len(vectors) != len(chunks) or any(
            len(v) != size or not all(math.isfinite(x) for x in v) for v in vectors
        ):
            raise ValueError("Invalid embeddings")
        candidate = f"{prefix}_{uuid4().hex}"
        client.create_collection(candidate, vectors_config=models.VectorParams(
            size=size, distance=models.Distance.COSINE))
        client.upsert(candidate, points=[models.PointStruct(
            id=str(uuid5(NAMESPACE_URL, json.dumps(chunk, sort_keys=True, ensure_ascii=False))),
            vector=vector, payload={**chunk, "_rag_fingerprint": digest},
        ) for chunk, vector in zip(chunks, vectors, strict=True)], wait=True)
        validate_index(client, candidate, chunks, digest)
    return {"alias": alias, "previous": previous, "candidate": candidate,
            "fingerprint": digest, "documents": len({c["source_document"] for c in chunks}),
            "chunks": len(chunks), "reused": reused}


def publish(client, state, *, restore=False):
    alias = state["alias"]
    if alias != rag.collection_name() or alias == rag.COLLECTION_NAME:
        raise ValueError("Unexpected production alias")
    target = state["previous"] if restore else state["candidate"]
    current = alias_target(client, alias)
    if current == target:
        return
    # Refuse to overwrite unrelated changes, including manual operations.
    if current not in (state["candidate"], state["previous"]):
        raise ValueError("Alias changed outside this deployment")
    if target is not None and not client.collection_exists(target):
        raise ValueError("Index target missing")
    actions = []
    if current is not None:
        actions.append(models.DeleteAliasOperation(delete_alias=models.DeleteAlias(alias_name=alias)))
    if target is not None:
        actions.append(models.CreateAliasOperation(create_alias=models.CreateAlias(
            alias_name=alias, collection_name=target)))
    if actions:
        client.update_collection_aliases(change_aliases_operations=actions)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["check", "prepare", "activate", "restore"])
    parser.add_argument("--state-b64")
    args = parser.parse_args()
    started = monotonic()
    try:
        settings = rag._settings()
        if args.action == "check":
            print(json.dumps({"stage": "configuration", "ok": True}))
            return
        with closing(QdrantClient(url=settings["qdrant_url"], timeout=10)) as client:
            if args.action == "prepare":
                result = prepare(client)
            else:
                state = json.loads(base64.b64decode(args.state_b64, validate=True))
                publish(client, state, restore=args.action == "restore")
                result = {"ok": True}
        print(json.dumps({**result, "stage": args.action, "seconds": round(monotonic() - started, 3)}))
    except Exception:
        print(json.dumps({"stage": args.action, "ok": False,
                          "error": "RAG operation failed; check configuration and provider availability"}), file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
