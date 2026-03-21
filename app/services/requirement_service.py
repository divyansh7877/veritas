from app.core import db


def create_requirement(task_id: str, title: str, description: str):
    return db.create_requirement(task_id, title, description)


def get_requirements(task_id: str) -> list[dict]:
    return db.list_requirements(task_id)
