from app.core import db


def create_spec_version(task_id: str, content: str) -> dict:
    existing = db.list_spec_versions(task_id)
    next_version = (existing[0]["version_number"] + 1) if existing else 1
    return db.create_spec_version(task_id, next_version, content)


def get_spec_versions(task_id: str) -> list[dict]:
    return db.list_spec_versions(task_id)


def update_spec_status(spec_id: str, status: str) -> dict:
    with db.get_client() as client:
        return client.patch(f"/spec_versions?id=eq.{spec_id}", json={"status": status}).json()
