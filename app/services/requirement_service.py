from app.core.db import get_supabase


def upsert_requirements(project_id: str, requirements: list[dict]) -> list[dict]:
    db = get_supabase()
    rows = [
        {
            "project_id": project_id,
            "department": r["department"],
            "title": r["title"],
            "description": r["description"],
            "status": "Active",
        }
        for r in requirements
    ]
    result = db.table("requirements").insert(rows).execute()
    return result.data


def get_requirements(project_id: str) -> list[dict]:
    db = get_supabase()
    result = db.table("requirements").select("*").eq("project_id", project_id).execute()
    return result.data
