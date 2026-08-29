import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BossBattleStatus
from app.schemas.promptmon import PromptmonResponse
from app.schemas.score import BossBattleScoreResponse


class BossBattlePromptCreate(BaseModel):
    prompt: str = Field(..., min_length=1)


class CurrentBossBattleResponse(BaseModel):
    boss_battle_id: uuid.UUID
    status: BossBattleStatus
    legendary_promptmon_name: str
    your_promptmon: PromptmonResponse
    your_turns_used: int
    max_turns: int = 3
    # boss_strategy_notes is intentionally excluded — that's the AI's internal
    # game plan against this specific player, never shown to them.


class BossBattleConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    boss_battle_id: uuid.UUID
    turn_number: int
    prompt: str
    gemini_response: str
    created_at: datetime


class FinishBossBattleResponse(BaseModel):
    boss_battle_id: uuid.UUID
    status: BossBattleStatus
    score: BossBattleScoreResponse