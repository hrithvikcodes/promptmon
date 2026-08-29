from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_session
from app.database.session import get_db
from app.models.promptmon import Promptmon
from app.models.session import Session
from app.schemas.promptmon import PromptmonCreate, PromptmonResponse
from app.services.promptmon_service import create_promptmon

router = APIRouter(prefix="/promptmons", tags=["promptmons"])


@router.post("", response_model=PromptmonResponse, status_code=status.HTTP_201_CREATED)
async def create_promptmon_endpoint(
    payload: PromptmonCreate,
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    return await create_promptmon(db, session, payload)


@router.get("/me", response_model=PromptmonResponse)
async def get_my_promptmon(
    session: Session = Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    """
    Lets a resuming session check whether it already has a Promptmon,
    without guessing from localStorage. 404 if none exists yet.
    """
    result = await db.execute(select(Promptmon).where(Promptmon.session_id == session.id))
    promptmon = result.scalar_one_or_none()
    if promptmon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Promptmon created yet.")
    return promptmon