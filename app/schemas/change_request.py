from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ChangeStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class ChangeRequestCreate(BaseModel):
    stakeholder_id: str
    description: str


class ChangeRequestRead(BaseModel):
    id: str
    project_id: str
    stakeholder_id: str
    description: str
    status: ChangeStatus
    created_at: datetime
    updated_at: datetime
