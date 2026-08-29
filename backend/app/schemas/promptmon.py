import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PromptmonCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    abilities: list[str] = Field(..., min_length=1)
    stats: dict[str, int]
    special_attack: str = Field(..., min_length=1, max_length=200)
    strengths: list[str] = Field(..., min_length=1)
    weaknesses: list[str] = Field(..., min_length=1)
    backstory: str = Field(..., min_length=1)


class PromptmonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    name: str
    type: str
    abilities: list[str]
    stats: dict[str, int]
    special_attack: str
    strengths: list[str]
    weaknesses: list[str]
    backstory: str
    image_url: Optional[str] = None
    creativity_score: Optional[float] = None
    creativity_reasoning: Optional[str] = None
    created_at: datetime