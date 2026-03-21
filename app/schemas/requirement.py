from datetime import datetime
from pydantic import BaseModel

from app.schemas.stakeholder import Department


class RequirementCreate(BaseModel):
    department: Department
    title: str
    description: str


class RequirementRead(BaseModel):
    id: str
    project_id: str
    department: Department
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
