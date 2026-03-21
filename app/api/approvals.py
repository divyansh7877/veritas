from fastapi import APIRouter

from app.schemas.approval import ApprovalRead, ApprovalRespond
from app.services import approval_service, spec_service

router = APIRouter(tags=["Approvals"])


@router.get("/projects/{project_id}/approvals", response_model=list[ApprovalRead])
def list_approvals(project_id: str):
    return approval_service.get_approvals_for_project(project_id)


@router.post("/projects/{project_id}/approvals/respond", response_model=ApprovalRead)
def respond_to_approval(project_id: str, data: ApprovalRespond):
    updated = approval_service.respond_to_approval(data.approval_id, data.status.value)

    approvals = approval_service.get_approvals_for_project(project_id)
    spec_ids = {a["spec_version_id"] for a in approvals}
    for spec_id in spec_ids:
        if approval_service.check_all_approved(spec_id):
            spec_service.update_spec_status(spec_id, "Approved")

    return updated
