from app.core import db


def create_conversation(task_id: str, author_id: str, question: dict, status: str = "pending"):
    return db.create_conversation(task_id, author_id, question, status)


def get_conversations(task_id: str) -> list[dict]:
    return db.list_conversations(task_id)


def get_conversation(conversation_id: str) -> dict | None:
    result = db.get_conversation(conversation_id)
    return result[0] if result else None


def update_conversation(conversation_id: str, answer: dict | None = None, status: str | None = None):
    return db.update_conversation(conversation_id, answer, status)
