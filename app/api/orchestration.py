from fastapi import APIRouter, HTTPException

from app.services.orchestration_service import run_merge_round
from app.services import project_service, conversation_service
from app.schemas.stakeholder import Department

router = APIRouter(tags=["Orchestration"])

ALL_DEPARTMENTS = [d.value for d in Department]


@router.post("/projects/{project_id}/orchestrate/start")
def start_round_one(project_id: str):
    """Initialize round 1 by creating conversations for all 3 departments."""
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["current_round"] != 0:
        raise HTTPException(status_code=400, detail="Round already started")

    project_service.update_project(project_id, {"current_round": 1})
    convos = []
    for dept in ALL_DEPARTMENTS:
        c = conversation_service.create_conversation(project_id, dept, 1)
        convos.append(c)

    return {"round": 1, "conversations": convos}


@router.post("/projects/{project_id}/orchestrate/merge-round")
def merge_round(project_id: str):
    return run_merge_round(project_id)
