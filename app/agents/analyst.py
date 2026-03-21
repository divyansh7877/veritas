import json
import re

from ai_sdk import generate_text
from app.agents.base import get_model, is_mock


def _extract_json(text: str) -> str:
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


GENERATE_TASKS_PROMPT = (
    "You are a senior software analyst. You have been given three sources of information "
    "about a project:\n\n"
    "1. CODEBASE ANALYSIS:\n{codebase_summary}\n\n"
    "2. DOCUMENTATION SUMMARY:\n{doc_summary}\n\n"
    "3. IMPROVEMENT SUGGESTIONS:\n{suggestions}\n\n"
    "Your job is to identify ambiguities, gaps, and conflicts between these three sources. "
    "For each issue found, create a task that a human needs to resolve.\n\n"
    "Categories:\n"
    '- "ambiguity": documentation says one thing but code does another\n'
    '- "gap": something mentioned in suggestions has no coverage in code or docs\n'
    '- "conflict": two sources contradict each other\n'
    '- "clarification": not enough information to proceed\n\n'
    "Return a JSON array of tasks. Each task must have:\n"
    '- "title": short title\n'
    '- "description": detailed description of the issue\n'
    '- "category": one of the categories above\n'
    '- "context": object with relevant references (code_refs, doc_refs, suggestion_refs)\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_TASKS = [
    {
        "title": "Unclear authentication strategy",
        "description": "Documentation mentions OAuth2 but the codebase uses basic JWT tokens. "
                       "The suggestion to add SSO conflicts with both approaches.",
        "category": "conflict",
        "context": {"code_refs": ["app/auth.py"], "doc_refs": ["security.md"], "suggestion_refs": [0]},
    },
    {
        "title": "Missing error handling specification",
        "description": "The codebase has minimal error handling and the documentation does not "
                       "specify error response formats. Need human decision on error strategy.",
        "category": "gap",
        "context": {"code_refs": ["app/api/"], "doc_refs": [], "suggestion_refs": []},
    },
    {
        "title": "Database migration strategy unclear",
        "description": "Suggestion requests schema changes but there is no migration tooling "
                       "in the codebase or documentation.",
        "category": "clarification",
        "context": {"code_refs": ["schema.sql"], "doc_refs": [], "suggestion_refs": [1]},
    },
]


def generate_tasks(
    codebase_analysis: dict,
    doc_summary: str,
    suggestions: list[dict],
) -> list[dict]:
    if is_mock():
        return MOCK_TASKS

    codebase_str = json.dumps(codebase_analysis, indent=2, default=str)
    suggestions_str = "\n".join(
        f"- [{s['title']}]: {s['description']}" for s in suggestions
    ) if suggestions else "(none provided)"

    model = get_model()
    result = generate_text(
        model=model,
        prompt=GENERATE_TASKS_PROMPT.format(
            codebase_summary=codebase_str,
            doc_summary=doc_summary or "(no documentation provided)",
            suggestions=suggestions_str,
        ),
    )
    try:
        cleaned = _extract_json(result.text)
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        return []


# Keep legacy function for backward compatibility with orchestration_service.run_single_pass
LEGACY_ANALYST_PROMPT = (
    "You are a requirements analyst. Read the following interview transcript "
    "and extract structured requirements.\n\n"
    "TRANSCRIPT:\n{transcript}\n\n"
    "Return a JSON array of requirements. Each requirement must have:\n"
    '- "title": a short title\n'
    '- "description": a detailed description\n\n'
    "Return ONLY valid JSON, no other text."
)

MOCK_REQUIREMENTS = [
    {"title": "Emissions Cap", "description": "Total facility emissions must not exceed 500 tons CO2e per year."},
    {"title": "Load Bearing Capacity", "description": "Primary structure must support 10,000 kg per floor."},
]


def extract_requirements(transcript: str) -> list[dict]:
    if is_mock():
        return MOCK_REQUIREMENTS

    model = get_model()
    result = generate_text(
        model=model,
        prompt=LEGACY_ANALYST_PROMPT.format(transcript=transcript),
    )
    try:
        cleaned = _extract_json(result.text)
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        return []
