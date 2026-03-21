from app.core import db


def create_conflicts(task_id: str, conflicts: list[dict]) -> list[dict]:
    results = []
    for c in conflicts:
        result = db.create_conflict(task_id, c["requirement_ids"], c["description"])
        results.append(result)
    return results


def get_conflicts(task_id: str) -> list[dict]:
    return db.list_conflicts(task_id)


def get_open_conflicts(task_id: str) -> list[dict]:
    conflicts = db.list_conflicts(task_id)
    return [c for c in conflicts if c.get("status") == "Open"]


def block_open_conflicts(task_id: str) -> list[dict]:
    conflicts = get_open_conflicts(task_id)
    blocked = []
    for c in conflicts:
        result = db.update_conflict_status(c["id"], "Blocked")
        blocked.append(result)
    return blocked
