from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database.session import get_db
from app.schemas.admin import RegisteredTeamResponse
from app.schemas.match import MatchResponse
from app.schemas.tournament import StartTournamentResponse, TournamentResponse
from app.services.admin_service import end_tournament, get_registered_teams
from app.services.boss_battle_service import start_final
from app.services.match_service import start_round_3, start_tournament
from app.services.tournament_service import get_current_tournament

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login")
async def admin_login(_: None = Depends(require_admin)):
    return {"status": "ok"}


@router.post("/start-tournament", response_model=StartTournamentResponse)
async def start_tournament_endpoint(_: None = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    return await start_tournament(db, tournament)


@router.post("/start-round-3", response_model=list[MatchResponse])
async def start_round_3_endpoint(_: None = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    return await start_round_3(db, tournament)


@router.post("/start-final")
async def start_final_endpoint(_: None = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    boss_battles = await start_final(db, tournament)
    return [
        {
            "boss_battle_id": bb.id,
            "session_id": bb.session_id,
            "legendary_promptmon_name": bb.legendary_promptmon_name,
        }
        for bb in boss_battles
    ]


@router.post("/end-tournament", response_model=TournamentResponse)
async def end_tournament_endpoint(_: None = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    return await end_tournament(db, tournament)


@router.get("/teams", response_model=list[RegisteredTeamResponse])
async def get_teams_endpoint(_: None = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    tournament = await get_current_tournament(db)
    rows = await get_registered_teams(db, tournament.id)
    return [
        RegisteredTeamResponse(
            session_id=session.id,
            team_name=session.team_name,
            has_promptmon=promptmon is not None,
            promptmon_name=promptmon.name if promptmon else None,
            creativity_score=promptmon.creativity_score if promptmon else None,
        )
        for session, promptmon in rows
    ]