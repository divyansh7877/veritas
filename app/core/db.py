import httpx
from app.core.config import settings

BASE_URL = f"{settings.supabase_url}/rest/v1"
HEADERS = {
    "apikey": settings.supabase_key,
    "Authorization": f"Bearer {settings.supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def get_client() -> httpx.Client:
    return httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=30.0)


# Tasks
def list_tasks():
    with get_client() as client:
        return client.get("/tasks").json()


def get_task(task_id: str):
    with get_client() as client:
        return client.get(f"/tasks?id=eq.{task_id}").json()


def create_task(topic: str):
    with get_client() as client:
        return client.post("/tasks", json={"topic": topic}).json()


def update_task(task_id: str, status: str):
    with get_client() as client:
        return client.patch(f"/tasks?id=eq.{task_id}", json={"status": status}).json()


# Conversations
def list_conversations(task_id: str | None = None):
    with get_client() as client:
        url = "/conversations"
        if task_id:
            url = f"/conversations?task_id=eq.{task_id}"
        return client.get(url).json()


def get_conversation(conversation_id: str):
    with get_client() as client:
        return client.get(f"/conversations?id=eq.{conversation_id}").json()


def create_conversation(task_id: str, author_id: str, question: dict, status: str = "pending"):
    with get_client() as client:
        return client.post("/conversations", json={
            "task_id": task_id,
            "author_id": author_id,
            "question": question,
            "status": status,
        }).json()


def update_conversation(conversation_id: str, answer: dict | None = None, status: str | None = None):
    payload = {}
    if answer is not None:
        payload["answer"] = answer
    if status is not None:
        payload["status"] = status
    with get_client() as client:
        return client.patch(f"/conversations?id=eq.{conversation_id}", json=payload).json()


# Requirements
def list_requirements(task_id: str):
    with get_client() as client:
        return client.get(f"/requirements?task_id=eq.{task_id}").json()


def create_requirement(task_id: str, title: str, description: str):
    with get_client() as client:
        return client.post("/requirements", json={
            "task_id": task_id,
            "title": title,
            "description": description,
        }).json()


# Conflicts
def list_conflicts(task_id: str):
    with get_client() as client:
        return client.get(f"/conflicts?task_id=eq.{task_id}").json()


def create_conflict(task_id: str, requirement_ids: list[str], description: str):
    with get_client() as client:
        return client.post("/conflicts", json={
            "task_id": task_id,
            "requirement_ids": requirement_ids,
            "description": description,
        }).json()


def update_conflict_status(conflict_id: str, status: str):
    with get_client() as client:
        return client.patch(f"/conflicts?id=eq.{conflict_id}", json={"status": status}).json()


# Spec Versions
def list_spec_versions(task_id: str):
    with get_client() as client:
        return client.get(f"/spec_versions?task_id=eq.{task_id}&order=version_number").json()


def create_spec_version(task_id: str, version_number: int, content: str, status: str = "Draft"):
    with get_client() as client:
        return client.post("/spec_versions", json={
            "task_id": task_id,
            "version_number": version_number,
            "content": content,
            "status": status,
        }).json()
