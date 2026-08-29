import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_session
from app.database.session import get_db
from app.models.session import Session
from app.schemas.conversation import ConversationResponse
from app.schemas.match import BattlePromptCreate, CurrentMatchResponse, FinishBattleResponse, MatchStatusResponse
from app.services.match_service import (
    finish_battle,
    get_current_match,
    get_match_status,
    submit_battle_prompt,
)

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/current", response_model=CurrentMatchResponse)
async def get_current_match_endpoint(
    session: Session = Depends(get_current_session), db: AsyncSession = Depends(get_db)
):
    return await get_current_match(db, session)


@router.get("/{match_id}/status", response_model=MatchStatusResponse)
async def get_match_status_endpoint(
    match_id: uuid.UUID,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await get_match_status(db, session, match_id)


@router.post("/{match_id}/prompts", response_model=ConversationResponse)
async def submit_prompt_endpoint(
    match_id: uuid.UUID,
    payload: BattlePromptCreate,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await submit_battle_prompt(db, session, match_id, payload)


@router.post("/{match_id}/finish", response_model=FinishBattleResponse)
async def finish_battle_endpoint(
    match_id: uuid.UUID,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await finish_battle(db, session, match_id)