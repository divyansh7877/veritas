from fastapi import APIRouter, HTTPException

from app.schemas.project import ProjectCreate, ProjectRead
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectRead)
def create_project(data: ProjectCreate):
    row = project_service.create_project(data)
    return row


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str):
    row = project_service.get_project(project_id)
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return row
