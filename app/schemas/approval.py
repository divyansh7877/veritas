from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ApprovalStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ApprovalRespond(BaseModel):
    approval_id: str
    status: ApprovalStatus


class ApprovalRead(BaseModel):
    id: str
    spec_version_id: str
    stakeholder_id: str
    status: ApprovalStatus
    created_at: datetime
    updated_at: datetime
