import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import MatchRound, MatchStatus
from app.schemas.promptmon import PromptmonResponse
from app.schemas.score import ScoreResponse


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: uuid.UUID
    round: MatchRound
    status: MatchStatus
    session_a_id: uuid.UUID
    session_b_id: uuid.UUID
    winner_session_id: Optional[uuid.UUID] = None
    scenario: str
    twist: Optional[str] = None
    created_at: datetime
    finished_at: Optional[datetime] = None


class BattlePromptCreate(BaseModel):
    prompt: str = Field(..., min_length=1)


class CurrentMatchResponse(BaseModel):
    match_id: uuid.UUID
    round: MatchRound
    status: MatchStatus
    scenario: str
    twist: Optional[str] = None
    your_promptmon: PromptmonResponse
    opponent_promptmon: PromptmonResponse
    your_turns_used: int
    max_turns: int = 1
    winner_session_id: Optional[uuid.UUID] = None


class FinishBattleResponse(BaseModel):
    match_id: uuid.UUID
    status: MatchStatus
    winner_session_id: Optional[uuid.UUID] = None
    your_score: ScoreResponse
    opponent_score: ScoreResponse

class MatchStatusResponse(BaseModel):
    match_id: uuid.UUID
    status: MatchStatus
    your_turns_used: int
    opponent_turns_used: int
    winner_session_id: Optional[uuid.UUID] = None