from datetime import datetime
from enum import Enum
from pydantic import BaseModel

from app.schemas.stakeholder import Department


class ConversationStatus(str, Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"


class ConversationRead(BaseModel):
    id: str
    project_id: str
    department: Department
    round_number: int
    status: ConversationStatus
    summary: str | None = None
    created_at: datetime
    updated_at: datetime
