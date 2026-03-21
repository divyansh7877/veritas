import json
import re
from ai_sdk import generate_text
from app.agents.base import get_model, is_mock


def _extract_json(text: str) -> str:
    """Strip markdown code fences if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()

ANALYST_PROMPT = (
    "You are a requirements analyst. Read the following interview transcript "
    "and extract structured requirements.\n\n"
    "TRANSCRIPT:\n{transcript}\n\n"
    "Return a JSON array of requirements. Each requirement must have:\n"
    '- "title": a short title\n'
    '- "description": a detailed description\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_REQUIREMENTS = [
    {
        "title": "Emissions Cap",
        "description": "Total facility emissions must not exceed 500 tons CO2e per year.",
    },
    {
        "title": "Load Bearing Capacity",
        "description": "Primary structure must support 10,000 kg per floor.",
    },
]


def extract_requirements(transcript: str) -> list[dict]:
    if is_mock():
        return MOCK_REQUIREMENTS

    model = get_model()
    result = generate_text(
        model=model,
        prompt=ANALYST_PROMPT.format(transcript=transcript),
    )
    try:
        cleaned = _extract_json(result.text)
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        return []
