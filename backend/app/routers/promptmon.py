from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_session
from app.database.session import get_db
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