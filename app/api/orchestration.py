from fastapi import APIRouter

from app.services.orchestration_service import run_merge_round

router = APIRouter(tags=["Orchestration"])


@router.post("/projects/{project_id}/orchestrate/merge-round")
def merge_round(project_id: str):
    return run_merge_round(project_id)
