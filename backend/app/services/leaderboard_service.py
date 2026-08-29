import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.boss_battle import BossBattle
from app.models.boss_battle_score import BossBattleScore
from app.models.enums import MatchRound
from app.models.match import Match
from app.models.promptmon import Promptmon
from app.models.score import Score
from app.models.session import Session


async def get_leaderboard(db: AsyncSession, tournament_id: uuid.UUID) -> list[dict]:
    sessions_result = await db.execute(
        select(Session, Promptmon)
        .join(Promptmon, Promptmon.session_id == Session.id)
        .where(Session.tournament_id == tournament_id)
    )
    rows = sessions_result.all()

    entries: list[dict] = []

    for session, promptmon in rows:
        creativity = promptmon.creativity_score or 0.0

        r2_result = await db.execute(
            select(Score.total)
            .join(Match, Match.id == Score.match_id)
            .where(Score.session_id == session.id, Match.round == MatchRound.ROUND_2)
        )
        round2_score = sum(r2_result.scalars().all())

        r3_result = await db.execute(
            select(Score.total)
            .join(Match, Match.id == Score.match_id)
            .where(Score.session_id == session.id, Match.round == MatchRound.ROUND_3)
        )
        round3_score = sum(r3_result.scalars().all())

        boss_result = await db.execute(
            select(BossBattleScore.total)
            .join(BossBattle, BossBattle.id == BossBattleScore.boss_battle_id)
            .where(BossBattle.session_id == session.id, BossBattle.tournament_id == tournament_id)
        )
        boss_score = sum(boss_result.scalars().all())

        total = creativity + round2_score + round3_score + boss_score

        entries.append(
            {
                "session_id": session.id,
                "team_name": session.team_name,
                "promptmon_name": promptmon.name,
                "creativity_score": creativity,
                "round2_score": round2_score,
                "round3_score": round3_score,
                "boss_score": boss_score,
                "total": total,
            }
        )

    entries.sort(key=lambda e: e["total"], reverse=True)
    return entries