import json
from ai_sdk import generate_text
from app.agents.base import get_model, is_mock

ANALYST_PROMPT = (
    "You are a requirements analyst. Read the following interview transcripts "
    "from the {department} department and extract structured requirements.\n\n"
    "TRANSCRIPT:\n{transcript}\n\n"
    "Return a JSON array of requirements. Each requirement must have:\n"
    '- "department": "{department}"\n'
    '- "title": a short title\n'
    '- "description": a detailed description\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_REQUIREMENTS = [
    {
        "department": "Environmental",
        "title": "Emissions Cap",
        "description": "Total facility emissions must not exceed 500 tons CO2e per year.",
    },
    {
        "department": "Engineering",
        "title": "Load Bearing Capacity",
        "description": "Primary structure must support 10,000 kg per floor.",
    },
    {
        "department": "C-Suite",
        "title": "ROI Timeline",
        "description": "Project must achieve positive ROI within 18 months of completion.",
    },
]


def extract_requirements(department: str, transcript: str) -> list[dict]:
    if is_mock():
        return [r for r in MOCK_REQUIREMENTS if r["department"] == department]

    model = get_model()
    result = generate_text(
        model=model,
        prompt=ANALYST_PROMPT.format(department=department, transcript=transcript),
    )
    try:
        parsed = json.loads(result.text)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        return []
