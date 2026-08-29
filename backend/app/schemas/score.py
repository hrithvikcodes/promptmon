import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    match_id: uuid.UUID
    session_id: uuid.UUID
    prompt_quality: float
    strategy: float
    adaptability: float
    battle_performance: float
    total: float
    reasoning: str
    created_at: datetime


class BossBattleScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    boss_battle_id: uuid.UUID
    prompt_quality: float
    strategy: float
    creativity: float
    adaptability: float
    final_battle_performance: float
    total: float
    reasoning: str
    created_at: datetime