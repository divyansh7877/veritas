from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class SpecStatus(str, Enum):
    DRAFT = "Draft"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"


class SpecVersionRead(BaseModel):
    id: str
    project_id: str
    version_number: int
    content: str
    status: SpecStatus
    created_at: datetime
    updated_at: datetime
