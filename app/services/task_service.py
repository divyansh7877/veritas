from app.core import db


def create_tasks(project_id: str | None, tasks: list[dict]) -> list[dict]:
    created = []
    for t in tasks:
        result = db.create_task(
            project_id=project_id,
            title=t["title"],
            description=t["description"],
            category=t.get("category", "ambiguity"),
            context=t.get("context"),
        )
        if isinstance(result, list):
            created.extend(result)
        else:
            created.append(result)
    return created


def get_tasks(project_id: str | None = None, status: str | None = None) -> list[dict]:
    return db.list_tasks(project_id, status)


def get_task(task_id: str) -> dict | None:
    result = db.get_task(task_id)
    return result[0] if result else None


def update_task(task_id: str, updates: dict) -> dict:
    result = db.update_task(task_id, updates)
    return result[0] if isinstance(result, list) and result else result


def resolve_task(task_id: str, resolution: str) -> dict:
    return update_task(task_id, {"status": "Resolved", "resolution": resolution})
