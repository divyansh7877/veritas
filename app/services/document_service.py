from app.core.db import get_supabase


def create_document(project_id: str, storage_path: str, extracted_summary: str | None = None) -> dict:
    db = get_supabase()
    result = db.table("documents").insert({
        "project_id": project_id,
        "storage_path": storage_path,
        "extracted_summary": extracted_summary,
    }).execute()
    return result.data[0]


def get_documents(project_id: str) -> list[dict]:
    db = get_supabase()
    result = db.table("documents").select("*").eq("project_id", project_id).execute()
    return result.data


def get_project_summary(project_id: str) -> str:
    """Concatenate all document summaries for a project."""
    docs = get_documents(project_id)
    summaries = [d["extracted_summary"] for d in docs if d.get("extracted_summary")]
    return "\n\n".join(summaries) if summaries else ""
