import uuid

from pydantic import BaseModel


class LeaderboardEntryResponse(BaseModel):
    session_id: uuid.UUID
    team_name: str
    promptmon_name: str
    creativity_score: float
    round2_score: float
    round3_score: float
    boss_score: float
    total: float


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntryResponse]