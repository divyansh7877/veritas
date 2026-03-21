from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import task_service, source_service, conversation_service
from app.agents.task_interviewer import task_interview_reply

router = APIRouter(prefix="/tasks", tags=["Tasks"])


class TaskMessageCreate(BaseModel):
    content: str


class ResolveRequest(BaseModel):
    resolution: str


@router.get("")
def list_tasks(project_id: str | None = None, status: str | None = None):
    return task_service.get_tasks(project_id, status)


@router.get("/{task_id}")
def get_task(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{task_id}/messages")
def send_task_message(task_id: str, data: TaskMessageCreate):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task["status"] == "Open":
        task_service.update_task(task_id, {"status": "In Progress"})

    # Get conversation history for this task
    conversations = conversation_service.get_conversations(task_id)
    chat_history = []
    for c in conversations:
        if c.get("question"):
            q = c["question"]
            chat_history.append({"sender_type": "Stakeholder", "content": q.get("content", str(q))})
        if c.get("answer"):
            a = c["answer"]
            chat_history.append({"sender_type": "Agent", "content": a.get("content", str(a))})

    project_context = source_service.get_project_context(task.get("project_id"))

    reply = task_interview_reply(
        task=task,
        project_context=project_context,
        chat_history=chat_history,
        user_message=data.content,
    )

    # Store as a conversation record
    conv = conversation_service.create_conversation(
        task_id=task_id,
        author_id="user",
        question={"content": data.content},
        status="resolved",
    )
    conversation_service.update_conversation(
        conv[0]["id"] if isinstance(conv, list) else conv["id"],
        answer={"content": reply},
    )

    return {"task_id": task_id, "user_message": data.content, "agent_reply": reply}


@router.post("/{task_id}/resolve")
def resolve_task(task_id: str, data: ResolveRequest):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] == "Resolved":
        raise HTTPException(status_code=400, detail="Task already resolved")

    updated = task_service.resolve_task(task_id, data.resolution)
    return updated
