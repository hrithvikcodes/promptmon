from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import Session
from app.schemas.session import SessionCreate
from app.services.tournament_service import get_current_tournament, require_waiting


async def create_session(db: AsyncSession, payload: SessionCreate) -> Session:
    tournament = await get_current_tournament(db)
    require_waiting(tournament)

    session = Session(tournament_id=tournament.id, team_name=payload.team_name)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session