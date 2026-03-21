from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class SenderType(str, Enum):
    AGENT = "Agent"
    STAKEHOLDER = "Stakeholder"


class MessageCreate(BaseModel):
    content: str


class MessageRead(BaseModel):
    id: str
    conversation_id: str
    sender_type: SenderType
    content: str
    created_at: datetime
