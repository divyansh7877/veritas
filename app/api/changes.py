from fastapi import APIRouter, HTTPException

from app.schemas.change_request import ChangeRequestCreate, ChangeRequestRead
from app.schemas.spec_version import SpecVersionRead
from app.services import change_service, spec_service, approval_service, stakeholder_service, project_service
from app.agents.writer import revise_spec, detect_impacted_departments

router = APIRouter(tags=["Changes"])


@router.post("/projects/{project_id}/changes")
def submit_change(project_id: str, data: ChangeRequestCreate):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    change = change_service.create_change_request(project_id, data)

    current_spec = spec_service.get_latest_approved_spec(project_id)
    if not current_spec:
        raise HTTPException(status_code=400, detail="No approved spec to revise")

    new_content = revise_spec(current_spec["content"], data.description)
    new_spec = spec_service.create_spec_version(project_id, new_content)
    spec_service.update_spec_status(new_spec["id"], "Pending Approval")

    impacted_depts = detect_impacted_departments(data.description)
    impacted_stakeholders = stakeholder_service.get_stakeholders_by_departments(
        project_id, impacted_depts
    )
    stakeholder_ids = [s["id"] for s in impacted_stakeholders]
    approval_service.create_approvals_for_spec(new_spec["id"], stakeholder_ids)

    return {
        "change_request": change,
        "new_spec_version": new_spec,
        "impacted_departments": impacted_depts,
        "approvals_created": len(stakeholder_ids),
    }
