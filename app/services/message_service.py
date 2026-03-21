from app.core.db import get_supabase


def create_message(conversation_id: str, sender_type: str, content: str) -> dict:
    db = get_supabase()
    result = db.table("messages").insert({
        "conversation_id": conversation_id,
        "sender_type": sender_type,
        "content": content,
    }).execute()
    return result.data[0]


def get_messages(conversation_id: str) -> list[dict]:
    db = get_supabase()
    result = (
        db.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return result.data
