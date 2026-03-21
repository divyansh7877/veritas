from ai_sdk import generate_text
from ai_sdk.types import CoreSystemMessage, CoreUserMessage, CoreAssistantMessage, TextPart
from app.agents.base import get_model, is_mock

SYSTEM_PROMPT = (
    "You are an expert requirements interviewer. "
    "Your goal is to extract clear, specific, and actionable requirements from the stakeholder.\n\n"
    "TASK TOPIC:\n{task_topic}\n\n"
    "{conflicts_context}"
    "Ask probing follow-up questions to clarify ambiguities. "
    "Focus on extracting measurable requirements with clear acceptance criteria. "
    "Be professional and thorough."
)

MOCK_REPLY = (
    "Thank you for that information. To clarify further: "
    "Could you specify the exact threshold or metric you'd consider acceptable? "
    "Also, how does this interact with the timeline constraints mentioned earlier?"
)


def interview_reply(
    task_topic: str,
    conflicts: list[dict],
    chat_history: list[dict],
    user_message: str,
) -> str:
    if is_mock():
        return MOCK_REPLY

    conflicts_context = ""
    if conflicts:
        conflict_lines = "\n".join(f"- {c['description']}" for c in conflicts)
        conflicts_context = (
            f"KNOWN CONFLICTS:\n{conflict_lines}\n\n"
            "Address these conflicts in your questions.\n\n"
        )

    system = SYSTEM_PROMPT.format(
        task_topic=task_topic,
        conflicts_context=conflicts_context,
    )

    messages = [CoreSystemMessage(content=system)]
    for msg in chat_history:
        if msg["sender_type"] == "Stakeholder":
            messages.append(CoreUserMessage(content=[TextPart(text=msg["content"])]))
        else:
            messages.append(CoreAssistantMessage(content=[TextPart(text=msg["content"])]))
    messages.append(CoreUserMessage(content=[TextPart(text=user_message)]))

    model = get_model()
    result = generate_text(model=model, messages=messages)
    return result.text
