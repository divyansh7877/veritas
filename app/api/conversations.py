from fastapi import APIRouter, HTTPException

from app.schemas.conversation import ConversationRead
from app.schemas.message import MessageCreate, MessageRead
from app.services import conversation_service, message_service, document_service, conflict_service
from app.agents.interviewer import interview_reply

router = APIRouter(tags=["Conversations"])


@router.get("/projects/{project_id}/conversations", response_model=list[ConversationRead])
def list_conversations(project_id: str):
    return conversation_service.get_conversations(project_id)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageRead])
def list_messages(conversation_id: str):
    return message_service.get_messages(conversation_id)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageRead)
def send_message(conversation_id: str, data: MessageCreate):
    conv = conversation_service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv["status"] == "Completed":
        raise HTTPException(status_code=400, detail="Conversation is already completed")

    message_service.create_message(conversation_id, "Stakeholder", data.content)

    project_summary = document_service.get_project_summary(conv["project_id"])
    conflicts = conflict_service.get_open_conflicts(conv["project_id"])
    chat_history = message_service.get_messages(conversation_id)

    reply = interview_reply(
        department=conv["department"],
        project_summary=project_summary,
        conflicts=conflicts,
        chat_history=chat_history,
        user_message=data.content,
    )

    agent_msg = message_service.create_message(conversation_id, "Agent", reply)
    return agent_msg


@router.post("/conversations/{conversation_id}/complete", response_model=ConversationRead)
def complete_conversation(conversation_id: str):
    conv = conversation_service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv["status"] == "Completed":
        raise HTTPException(status_code=400, detail="Already completed")

    updated = conversation_service.complete_conversation(conversation_id)
    return updated
