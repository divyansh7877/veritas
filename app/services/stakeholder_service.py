from app.core.db import get_supabase
from app.schemas.stakeholder import StakeholderCreate


def create_stakeholder(project_id: str, data: StakeholderCreate) -> dict:
    db = get_supabase()
    result = db.table("stakeholders").insert({
        "project_id": project_id,
        "name": data.name,
        "department": data.department.value,
    }).execute()
    return result.data[0]


def get_stakeholders(project_id: str) -> list[dict]:
    db = get_supabase()
    result = db.table("stakeholders").select("*").eq("project_id", project_id).execute()
    return result.data


def get_stakeholders_by_departments(project_id: str, departments: list[str]) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("stakeholders")
        .select("*")
        .eq("project_id", project_id)
        .in_("department", departments)
        .execute()
    )
    return result.data
