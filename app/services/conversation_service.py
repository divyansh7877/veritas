from app.core.db import get_supabase


def create_conversation(project_id: str, department: str, round_number: int) -> dict:
    db = get_supabase()
    result = db.table("conversations").insert({
        "project_id": project_id,
        "department": department,
        "round_number": round_number,
        "status": "Active",
    }).execute()
    return result.data[0]


def get_conversations(project_id: str, round_number: int | None = None) -> list[dict]:
    db = get_supabase()
    query = db.table("conversations").select("*").eq("project_id", project_id)
    if round_number is not None:
        query = query.eq("round_number", round_number)
    result = query.order("created_at").execute()
    return result.data


def get_conversation(conversation_id: str) -> dict | None:
    db = get_supabase()
    result = db.table("conversations").select("*").eq("id", conversation_id).execute()
    return result.data[0] if result.data else None


def complete_conversation(conversation_id: str, summary: str | None = None) -> dict:
    db = get_supabase()
    updates: dict = {"status": "Completed"}
    if summary:
        updates["summary"] = summary
    result = db.table("conversations").update(updates).eq("id", conversation_id).execute()
    return result.data[0]
