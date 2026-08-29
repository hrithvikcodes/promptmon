import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import TournamentStatus
from app.schemas.match import MatchResponse


class TournamentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: TournamentStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class WaitingStatusResponse(BaseModel):
    tournament_status: TournamentStatus
    registered_teams_count: int


class StartTournamentResponse(BaseModel):
    action: str
    tournament: TournamentResponse
    matches: list[MatchResponse]
    message: str