from app.core.db import get_supabase
from app.schemas.project import ProjectCreate


def create_project(data: ProjectCreate) -> dict:
    db = get_supabase()
    result = db.table("projects").insert({"name": data.name}).execute()
    return result.data[0]


def get_project(project_id: str) -> dict | None:
    db = get_supabase()
    result = db.table("projects").select("*").eq("id", project_id).execute()
    return result.data[0] if result.data else None


def update_project(project_id: str, updates: dict) -> dict:
    db = get_supabase()
    result = db.table("projects").update(updates).eq("id", project_id).execute()
    return result.data[0]
