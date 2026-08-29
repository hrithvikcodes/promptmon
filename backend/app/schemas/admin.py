import uuid
from typing import Optional

from pydantic import BaseModel


class RegisteredTeamResponse(BaseModel):
    session_id: uuid.UUID
    team_name: str
    has_promptmon: bool
    promptmon_name: Optional[str] = None
    creativity_score: Optional[float] = None