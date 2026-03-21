from app.core.db import get_supabase
from app.schemas.change_request import ChangeRequestCreate


def create_change_request(project_id: str, data: ChangeRequestCreate) -> dict:
    db = get_supabase()
    result = db.table("change_requests").insert({
        "project_id": project_id,
        "stakeholder_id": data.stakeholder_id,
        "description": data.description,
        "status": "Pending",
    }).execute()
    return result.data[0]
