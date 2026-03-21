from app.services import conversation_service, requirement_service, conflict_service, spec_service
from app.agents.analyst import extract_requirements
from app.agents.reviewer import detect_conflicts
from app.agents.writer import generate_spec


def run_single_pass(task_id: str) -> dict:
    """Run a single-pass analysis on a task.

    1. Extract requirements from conversation transcripts
    2. Detect conflicts between requirements
    3. Generate a specification document
    """
    conversations = conversation_service.get_conversations(task_id)
    if not conversations:
        return {
            "action": "no_conversations",
            "requirements_extracted": 0,
            "conflicts_found": 0,
        }

    # Build transcript from conversations
    transcript_parts = []
    for conv in conversations:
        question = conv.get("question", {})
        answer = conv.get("answer", {})
        if isinstance(question, dict):
            transcript_parts.append(f"Q: {question.get('content', str(question))}")
        if isinstance(answer, dict):
            transcript_parts.append(f"A: {answer.get('content', str(answer))}")

    transcript = "\n".join(transcript_parts)

    # Extract requirements
    requirements = extract_requirements(transcript)

    # Save requirements
    saved_requirements = []
    for req in requirements:
        result = requirement_service.create_requirement(
            task_id=task_id,
            title=req["title"],
            description=req["description"],
        )
        saved_requirements.append(result)

    # Detect conflicts
    conflicts = detect_conflicts(requirements)

    # Save conflicts
    saved_conflicts = []
    for conflict in conflicts:
        # Map requirement titles to IDs (we use first match)
        requirement_ids = []
        for saved in saved_requirements:
            if saved[0].get("title") in conflict.get("requirement_titles", []):
                requirement_ids.append(saved[0]["id"])
        result = conflict_service.create_conflicts(task_id, [{
            "requirement_ids": requirement_ids,
            "description": conflict["description"],
        }])
        saved_conflicts.append(result)

    # Generate spec
    spec_content = generate_spec(requirements, conflicts)
    spec = spec_service.create_spec_version(task_id, spec_content)

    return {
        "action": "completed",
        "requirements_extracted": len(requirements),
        "conflicts_found": len(conflicts),
        "spec_version_id": spec[0]["id"] if spec else None,
        "spec_content": spec_content,
    }
