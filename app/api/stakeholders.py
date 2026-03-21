from fastapi import APIRouter

from app.schemas.stakeholder import StakeholderCreate, StakeholderRead
from app.services import stakeholder_service

router = APIRouter(prefix="/projects/{project_id}/stakeholders", tags=["Stakeholders"])


@router.post("", response_model=StakeholderRead)
def create_stakeholder(project_id: str, data: StakeholderCreate):
    row = stakeholder_service.create_stakeholder(project_id, data)
    return row


@router.get("", response_model=list[StakeholderRead])
def list_stakeholders(project_id: str):
    return stakeholder_service.get_stakeholders(project_id)
