from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.session import SessionCreate, SessionResponse
from app.services.session_service import create_session

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def register_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    return await create_session(db, payload)