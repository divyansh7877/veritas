from datetime import datetime
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str


class ProjectRead(BaseModel):
    id: str
    name: str
    status: str
    current_round: int
    created_at: datetime
    updated_at: datetime
