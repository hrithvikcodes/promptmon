import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_session
from app.database.session import get_db
from app.models.session import Session
from app.schemas.boss_battle import (
    BossBattleConversationResponse,
    BossBattlePromptCreate,
    CurrentBossBattleResponse,
    FinishBossBattleResponse,
)
from app.services.boss_battle_service import finish_boss_battle, get_current_boss_battle, submit_boss_battle_prompt

router = APIRouter(prefix="/boss-battles", tags=["boss-battles"])


@router.get("/current", response_model=CurrentBossBattleResponse)
async def get_current_boss_battle_endpoint(
    session: Session = Depends(get_current_session), db: AsyncSession = Depends(get_db)
):
    return await get_current_boss_battle(db, session)


@router.post("/{boss_battle_id}/prompts", response_model=BossBattleConversationResponse)
async def submit_boss_battle_prompt_endpoint(
    boss_battle_id: uuid.UUID,
    payload: BossBattlePromptCreate,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await submit_boss_battle_prompt(db, session, boss_battle_id, payload)


@router.post("/{boss_battle_id}/finish", response_model=FinishBossBattleResponse)
async def finish_boss_battle_endpoint(
    boss_battle_id: uuid.UUID,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await finish_boss_battle(db, session, boss_battle_id)