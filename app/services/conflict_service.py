from app.core.db import get_supabase


def create_conflicts(project_id: str, conflicts: list[dict]) -> list[dict]:
    db = get_supabase()
    rows = [
        {
            "project_id": project_id,
            "requirement_ids": c["requirement_ids"],
            "description": c["description"],
            "status": "Open",
        }
        for c in conflicts
    ]
    if not rows:
        return []
    result = db.table("conflicts").insert(rows).execute()
    return result.data


def get_open_conflicts(project_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("conflicts")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "Open")
        .execute()
    )
    return result.data


def block_open_conflicts(project_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("conflicts")
        .update({"status": "Blocked"})
        .eq("project_id", project_id)
        .eq("status", "Open")
        .execute()
    )
    return result.data
