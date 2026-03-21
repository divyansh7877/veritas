from app.core.db import get_supabase


def create_spec_version(project_id: str, content: str) -> dict:
    db = get_supabase()
    existing = (
        db.table("spec_versions")
        .select("version_number")
        .eq("project_id", project_id)
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    next_version = (existing.data[0]["version_number"] + 1) if existing.data else 1
    result = db.table("spec_versions").insert({
        "project_id": project_id,
        "version_number": next_version,
        "content": content,
        "status": "Draft",
    }).execute()
    return result.data[0]


def get_spec_versions(project_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("spec_versions")
        .select("*")
        .eq("project_id", project_id)
        .order("version_number", desc=True)
        .execute()
    )
    return result.data


def get_latest_approved_spec(project_id: str) -> dict | None:
    db = get_supabase()
    result = (
        db.table("spec_versions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "Approved")
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def update_spec_status(spec_id: str, status: str) -> dict:
    db = get_supabase()
    result = db.table("spec_versions").update({"status": status}).eq("id", spec_id).execute()
    return result.data[0]
