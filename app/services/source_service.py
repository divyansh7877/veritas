from app.core import db


def create_source(project_id: str | None, source_type: str, name: str,
                   content: str | None = None, metadata: dict | None = None) -> dict:
    result = db.create_source(project_id, source_type, name, content, metadata)
    return result[0] if isinstance(result, list) else result


def get_sources(project_id: str | None = None, source_type: str | None = None) -> list[dict]:
    return db.list_sources(project_id, source_type)


def get_project_context(project_id: str) -> str:
    sources = get_sources(project_id)
    parts: list[str] = []
    for s in sources:
        label = f"[{s['source_type']}] {s['name']}"
        body = s.get("content") or ""
        parts.append(f"{label}\n{body}")
    return "\n\n---\n\n".join(parts) if parts else ""
