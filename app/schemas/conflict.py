from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ConflictStatus(str, Enum):
    OPEN = "Open"
    RESOLVED = "Resolved"
    BLOCKED = "Blocked"


class ConflictRead(BaseModel):
    id: str
    project_id: str
    requirement_ids: list[str]
    description: str
    status: ConflictStatus
    created_at: datetime
    updated_at: datetime
