from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.leaderboard import LeaderboardResponse
from app.services.leaderboard_service import get_leaderboard
from app.services.tournament_service import get_current_tournament

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard_endpoint(db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    entries = await get_leaderboard(db, tournament.id)
    return LeaderboardResponse(entries=entries)