from app.core.db import get_supabase


def create_approvals_for_spec(spec_version_id: str, stakeholder_ids: list[str]) -> list[dict]:
    db = get_supabase()
    rows = [
        {"spec_version_id": spec_version_id, "stakeholder_id": sid, "status": "Pending"}
        for sid in stakeholder_ids
    ]
    if not rows:
        return []
    result = db.table("approvals").insert(rows).execute()
    return result.data


def get_approvals_for_project(project_id: str) -> list[dict]:
    db = get_supabase()
    specs = (
        db.table("spec_versions")
        .select("id")
        .eq("project_id", project_id)
        .execute()
    )
    spec_ids = [s["id"] for s in specs.data]
    if not spec_ids:
        return []
    result = db.table("approvals").select("*").in_("spec_version_id", spec_ids).execute()
    return result.data


def respond_to_approval(approval_id: str, status: str) -> dict:
    db = get_supabase()
    result = db.table("approvals").update({"status": status}).eq("id", approval_id).execute()
    return result.data[0]


def check_all_approved(spec_version_id: str) -> bool:
    db = get_supabase()
    result = db.table("approvals").select("status").eq("spec_version_id", spec_version_id).execute()
    return all(a["status"] == "Approved" for a in result.data) if result.data else False
