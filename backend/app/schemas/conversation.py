import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    match_id: uuid.UUID
    session_id: uuid.UUID
    turn_number: int
    prompt: str
    gemini_response: str
    created_at: datetime