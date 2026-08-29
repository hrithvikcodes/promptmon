import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import TournamentStatus
from app.models.promptmon import Promptmon
from app.models.session import Session
from app.models.tournament import Tournament


async def get_registered_teams(db: AsyncSession, tournament_id: uuid.UUID):
    result = await db.execute(
        select(Session, Promptmon)
        .outerjoin(Promptmon, Promptmon.session_id == Session.id)
        .where(Session.tournament_id == tournament_id)
    )
    return result.all()


async def end_tournament(db: AsyncSession, tournament: Tournament) -> Tournament:
    if tournament.status == TournamentStatus.FINISHED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament already finished.")

    tournament.status = TournamentStatus.FINISHED
    tournament.ended_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(tournament)
    return tournament