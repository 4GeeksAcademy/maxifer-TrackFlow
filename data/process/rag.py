from __future__ import annotations

import re
from pathlib import Path


EXPECTED_DOCUMENTS = {
    "sla-delivery",
    "returns-policy",
    "carrier-coverage",
    "storage-pricing",
}
_HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
_LIST_ITEM = re.compile(r"^\s*(?:[-*+]\s+|\d+[.)]\s+)")


class CorpusError(ValueError):
    pass


def source_document_id(path: Path) -> str:
    stem = path.stem
    stem = re.sub(r"\.es$", "", stem)
    return stem.removeprefix("trackflow-")


def chunk_markdown(content: str, source_document: str) -> list[dict[str, str | int]]:
    """Keep headings, paragraphs, and contiguous lists as semantic units."""
    chunks: list[dict[str, str | int]] = []
    heading_stack: list[tuple[int, str]] = []
    pending: list[str] = []
    pending_kind: str | None = None

    def flush() -> None:
        nonlocal pending, pending_kind
        body = "\n".join(line.strip() for line in pending).strip()
        if body:
            section = " > ".join(title for _, title in heading_stack) or "General"
            chunks.append({
                "company": "trackflow",
                "source_document": source_document,
                "section": section,
                "language": "es",
                "chunk_index": len(chunks),
                "text": f"{section}\n{body}",
            })
        pending = []
        pending_kind = None

    for line in content.splitlines():
        heading = _HEADING.match(line)
        if heading:
            flush()
            level = len(heading.group(1))
            while heading_stack and heading_stack[-1][0] >= level:
                heading_stack.pop()
            heading_stack.append((level, heading.group(2)))
            continue

        if not line.strip():
            flush()
            continue

        is_list_item = bool(_LIST_ITEM.match(line))
        is_list_continuation = pending_kind == "list" and line[:1].isspace()
        line_kind = "list" if is_list_item or is_list_continuation else "paragraph"
        if pending_kind is not None and pending_kind != line_kind:
            flush()
        pending_kind = line_kind
        pending.append(line)

    flush()
    return chunks


def load_corpus_chunks(corpus_dir: Path) -> list[dict[str, str | int]]:
    if not corpus_dir.is_dir():
        raise CorpusError(f"No existe el corpus RAG: {corpus_dir}")

    documents = sorted(corpus_dir.glob("*.md"))
    found = {source_document_id(path) for path in documents}
    missing = EXPECTED_DOCUMENTS - found
    if missing:
        raise CorpusError(f"Faltan documentos fuente: {', '.join(sorted(missing))}")

    chunks: list[dict[str, str | int]] = []
    counts: dict[str, int] = {}
    for path in documents:
        source_document = source_document_id(path)
        document_chunks = chunk_markdown(
            path.read_text(encoding="utf-8"), source_document
        )
        if len(document_chunks) < 3:
            raise CorpusError(
                f"{path.name} debe producir al menos 3 chunks; produjo {len(document_chunks)}"
            )
        counts[source_document] = len(document_chunks)
        chunks.extend(document_chunks)

    if any(counts.get(source, 0) < 3 for source in EXPECTED_DOCUMENTS):
        raise CorpusError("Cada documento fuente debe producir al menos 3 chunks")
    return chunks