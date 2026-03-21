from datetime import datetime
from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: str
    project_id: str
    storage_path: str
    extracted_summary: str | None = None
    created_at: datetime
