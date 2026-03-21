from fastapi import HTTPException

from app.services import (
    conversation_service,
    message_service,
    requirement_service,
    conflict_service,
    project_service,
)
from app.agents.analyst import extract_requirements
from app.agents.reviewer import detect_conflicts
from app.schemas.stakeholder import Department

ALL_DEPARTMENTS = [d.value for d in Department]


def run_merge_round(project_id: str) -> dict:
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    current_round = project["current_round"]
    if current_round < 1:
        raise HTTPException(status_code=400, detail="No rounds have been started yet")

    convos = conversation_service.get_conversations(project_id, round_number=current_round)
    dept_convos = {c["department"]: c for c in convos}

    for dept in ALL_DEPARTMENTS:
        if dept not in dept_convos:
            raise HTTPException(
                status_code=400,
                detail=f"Missing conversation for {dept} in round {current_round}",
            )
        if dept_convos[dept]["status"] != "Completed":
            raise HTTPException(
                status_code=400,
                detail=f"Conversation for {dept} in round {current_round} is not completed",
            )

    all_new_requirements = []
    for dept in ALL_DEPARTMENTS:
        conv = dept_convos[dept]
        msgs = message_service.get_messages(conv["id"])
        transcript = "\n".join(
            f"[{m['sender_type']}]: {m['content']}" for m in msgs
        )
        reqs = extract_requirements(dept, transcript)
        all_new_requirements.extend(reqs)

    if all_new_requirements:
        requirement_service.upsert_requirements(project_id, all_new_requirements)

    all_requirements = requirement_service.get_requirements(project_id)
    new_conflicts = detect_conflicts(all_requirements)

    if new_conflicts:
        conflict_service.create_conflicts(project_id, new_conflicts)

    open_conflicts = conflict_service.get_open_conflicts(project_id)

    if open_conflicts and current_round < 3:
        next_round = current_round + 1
        project_service.update_project(project_id, {"current_round": next_round})
        for dept in ALL_DEPARTMENTS:
            conversation_service.create_conversation(project_id, dept, next_round)
        return {
            "action": "next_round",
            "round": next_round,
            "conflicts_found": len(open_conflicts),
            "requirements_extracted": len(all_new_requirements),
        }

    if open_conflicts and current_round >= 3:
        conflict_service.block_open_conflicts(project_id)
        return {
            "action": "blocked",
            "round": current_round,
            "conflicts_blocked": len(open_conflicts),
            "requirements_extracted": len(all_new_requirements),
        }

    return {
        "action": "resolved",
        "round": current_round,
        "conflicts_found": 0,
        "requirements_extracted": len(all_new_requirements),
    }
