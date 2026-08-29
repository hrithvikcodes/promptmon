from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.session import Session
from app.schemas.tournament import WaitingStatusResponse
from app.services.tournament_service import get_current_tournament

router = APIRouter(prefix="/tournament", tags=["tournament"])


@router.get("/waiting-status", response_model=WaitingStatusResponse)
async def get_waiting_status(db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)

    count_result = await db.execute(
        select(func.count()).select_from(Session).where(Session.tournament_id == tournament.id)
    )
    registered_teams_count = count_result.scalar_one()

    return WaitingStatusResponse(
        tournament_status=tournament.status,
        registered_teams_count=registered_teams_count,
    )