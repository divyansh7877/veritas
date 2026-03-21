import json

from ai_sdk import generate_text
from ai_sdk.types import CoreSystemMessage, CoreUserMessage, CoreAssistantMessage, TextPart
from app.agents.base import get_model, is_mock

SYSTEM_PROMPT = (
    "You are an expert technical analyst helping resolve a specific task.\n\n"
    "TASK: {title}\n"
    "DESCRIPTION: {description}\n"
    "CATEGORY: {category}\n\n"
    "RELEVANT CONTEXT:\n{context}\n\n"
    "PROJECT CONTEXT:\n{project_context}\n\n"
    "Your goal is to ask the human targeted questions to resolve this task. "
    "Be specific about what decision or clarification is needed. "
    "Once you have enough information, summarize the resolution clearly."
)

MOCK_REPLY = (
    "Thank you for that clarification. To make sure I understand correctly: "
    "could you confirm the specific approach you'd prefer? "
    "Also, are there any constraints I should be aware of?"
)


def task_interview_reply(
    task: dict,
    project_context: str,
    chat_history: list[dict],
    user_message: str,
) -> str:
    if is_mock():
        return MOCK_REPLY

    context_str = json.dumps(task.get("context", {}), indent=2, default=str)

    system = SYSTEM_PROMPT.format(
        title=task["title"],
        description=task["description"],
        category=task.get("category", ""),
        context=context_str,
        project_context=project_context,
    )

    messages = [CoreSystemMessage(content=system)]
    for msg in chat_history:
        sender = msg.get("sender_type") or msg.get("author_id", "user")
        if sender in ("Stakeholder", "user"):
            messages.append(CoreUserMessage(content=[TextPart(text=msg["content"])]))
        else:
            messages.append(CoreAssistantMessage(content=[TextPart(text=msg["content"])]))
    messages.append(CoreUserMessage(content=[TextPart(text=user_message)]))

    model = get_model()
    result = generate_text(model=model, messages=messages)
    return result.text
