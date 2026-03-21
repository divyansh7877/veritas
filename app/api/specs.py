from fastapi import APIRouter, HTTPException

from app.schemas.spec_version import SpecVersionRead
from app.services import requirement_service, conflict_service, spec_service, approval_service, stakeholder_service, project_service
from app.agents.writer import generate_spec

router = APIRouter(tags=["Specs"])


@router.post("/projects/{project_id}/spec/generate", response_model=SpecVersionRead)
def generate_project_spec(project_id: str):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    requirements = requirement_service.get_requirements(project_id)
    conflicts = conflict_service.get_open_conflicts(project_id)

    existing_specs = spec_service.get_spec_versions(project_id)
    version = (existing_specs[0]["version_number"] + 1) if existing_specs else 1

    content = generate_spec(requirements, conflicts, version)
    spec = spec_service.create_spec_version(project_id, content)

    spec_service.update_spec_status(spec["id"], "Pending Approval")

    stakeholders = stakeholder_service.get_stakeholders(project_id)
    stakeholder_ids = [s["id"] for s in stakeholders]
    approval_service.create_approvals_for_spec(spec["id"], stakeholder_ids)

    return spec_service.get_spec_versions(project_id)[0]


@router.get("/projects/{project_id}/specs", response_model=list[SpecVersionRead])
def list_specs(project_id: str):
    return spec_service.get_spec_versions(project_id)
