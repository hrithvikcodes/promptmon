from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import TournamentStatus
from app.models.tournament import Tournament


async def get_current_tournament(db: AsyncSession) -> Tournament:
    """
    Returns the most recently created Tournament. If none exists yet
    (fresh database), bootstraps the very first one in WAITING status —
    this is what makes "tournament starts in Waiting" true on day one
    without needing a separate seed script.
    """
    result = await db.execute(
        select(Tournament).order_by(Tournament.created_at.desc()).limit(1)
    )
    tournament = result.scalar_one_or_none()

    if tournament is None:
        tournament = Tournament(status=TournamentStatus.WAITING)
        db.add(tournament)
        await db.commit()
        await db.refresh(tournament)

    return tournament


def require_waiting(tournament: Tournament) -> None:
    if tournament.status != TournamentStatus.WAITING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Registration is closed — tournament is currently '{tournament.status.value}'.",
        )

def require_tournament_active(tournament: Tournament) -> None:
    if tournament.status == TournamentStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "TOURNAMENT_FINISHED", "message": "This tournament has ended."},
        )