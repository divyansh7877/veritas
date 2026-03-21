import json
import re
from ai_sdk import generate_text
from app.agents.base import get_model, is_mock


def _extract_json(text: str) -> str:
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()

REVIEWER_PROMPT = (
    "You are a requirements reviewer. "
    "Analyze the following requirements and identify conflicts "
    "or contradictions between them.\n\n"
    "REQUIREMENTS:\n{requirements_json}\n\n"
    "Return a JSON array of conflicts. Each conflict must have:\n"
    '- "requirement_titles": array of requirement titles that conflict\n'
    '- "description": explanation of the conflict\n\n'
    "If no conflicts exist, return an empty array [].\n"
    "Return ONLY valid JSON, no other text."
)

MOCK_CONFLICTS = [
    {
        "requirement_titles": ["Emissions Cap", "Load Bearing Capacity"],
        "description": "The emissions cap may conflict with load requirements regarding material choices.",
    },
]


def detect_conflicts(requirements: list[dict]) -> list[dict]:
    if is_mock():
        return MOCK_CONFLICTS

    model = get_model()
    req_json = json.dumps(requirements, indent=2, default=str)
    result = generate_text(
        model=model,
        prompt=REVIEWER_PROMPT.format(requirements_json=req_json),
    )
    try:
        cleaned = _extract_json(result.text)
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        return []
