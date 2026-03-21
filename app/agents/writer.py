import json
import re
from ai_sdk import generate_text
from app.agents.base import get_model, is_mock


def _extract_json(text: str) -> str:
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()

WRITER_PROMPT = (
    "You are a technical specification writer. Generate a comprehensive markdown specification "
    "document based on the following requirements and conflicts.\n\n"
    "REQUIREMENTS:\n{requirements_json}\n\n"
    "CONFLICTS:\n{conflicts_json}\n\n"
    "Create a well-structured specification with:\n"
    "1. Executive Summary\n"
    "2. Requirements\n"
    "3. Known Conflicts and Resolutions\n"
    "4. Acceptance Criteria\n"
    "5. Open Items\n\n"
    "Write in professional markdown format."
)

CHANGE_WRITER_PROMPT = (
    "You are a technical specification writer. A change request has been submitted. "
    "Update the existing specification to incorporate the change.\n\n"
    "CURRENT SPEC:\n{current_spec}\n\n"
    "CHANGE REQUEST:\n{change_description}\n\n"
    "Return the full updated specification in markdown format."
)

MOCK_SPEC = """# Specification v{version}

## Executive Summary
This specification outlines the gathered requirements.

## Requirements

### Requirements
- Emissions Cap: Total facility emissions must not exceed 500 tons CO2e per year.
- Load Bearing Capacity: Primary structure must support 10,000 kg per floor.

## Known Conflicts
- The emissions cap may conflict with load requirements regarding material choices.

## Acceptance Criteria
- All requirements must be met before sign-off.

## Open Items
- Material selection pending assessment.
"""


def generate_spec(requirements: list[dict], conflicts: list[dict], version: int = 1) -> str:
    if is_mock():
        return MOCK_SPEC.format(version=version)

    model = get_model()
    result = generate_text(
        model=model,
        prompt=WRITER_PROMPT.format(
            requirements_json=json.dumps(requirements, indent=2, default=str),
            conflicts_json=json.dumps(conflicts, indent=2, default=str),
        ),
    )
    return result.text


def revise_spec(current_spec: str, change_description: str) -> str:
    if is_mock():
        return current_spec + f"\n\n## Change Addendum\n{change_description}\n"

    model = get_model()
    result = generate_text(
        model=model,
        prompt=CHANGE_WRITER_PROMPT.format(
            current_spec=current_spec,
            change_description=change_description,
        ),
    )
    return result.text
