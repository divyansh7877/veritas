from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class Department(str, Enum):
    ENVIRONMENTAL = "Environmental"
    C_SUITE = "C-Suite"
    ENGINEERING = "Engineering"


class StakeholderCreate(BaseModel):
    name: str
    department: Department


class StakeholderRead(BaseModel):
    id: str
    project_id: str
    name: str
    department: Department
    created_at: datetime
