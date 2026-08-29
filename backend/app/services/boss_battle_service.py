import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.tournament_service import require_tournament_active
from app.models.boss_battle import BossBattle
from app.models.boss_battle_conversation import BossBattleConversation
from app.models.boss_battle_score import BossBattleScore
from app.models.conversation import Conversation
from app.models.enums import BossBattleStatus, MatchRound, MatchStatus
from app.models.match import Match
from app.models.promptmon import Promptmon
from app.models.score import Score
from app.models.session import Session
from app.models.tournament import Tournament
from app.schemas.boss_battle import BossBattlePromptCreate, CurrentBossBattleResponse, FinishBossBattleResponse
from app.services import ai_boss_battle_service, ai_boss_judge_service, ai_boss_service

MAX_TURNS = 3


async def _get_promptmon(db: AsyncSession, session_id: uuid.UUID) -> Promptmon:
    result = await db.execute(select(Promptmon).where(Promptmon.session_id == session_id))
    promptmon = result.scalar_one_or_none()
    if promptmon is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This team never created a Promptmon.")
    return promptmon


async def start_final(db: AsyncSession, tournament: Tournament) -> list[BossBattle]:
    result = await db.execute(
        select(Match).where(Match.tournament_id == tournament.id, Match.round == MatchRound.ROUND_3)
    )
    round3_matches = list(result.scalars().all())

    if not round3_matches:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Round 3 hasn't started.")
    if any(m.status != MatchStatus.FINISHED for m in round3_matches):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All Round 3 matches must finish before the Final Round can start.",
        )

    existing = await db.execute(select(BossBattle).where(BossBattle.tournament_id == tournament.id))
    if existing.scalars().first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Final Round already started.")

    # Finalists are exactly the Round 3 winners, whatever that count is —
    # per your call, not a fixed "top 3".
    finalist_ids = [m.winner_session_id for m in round3_matches if m.winner_session_id]

    boss_battles: list[BossBattle] = []

    for session_id in finalist_ids:
        promptmon = await _get_promptmon(db, session_id)

        conversations_result = await db.execute(
            select(Conversation).where(Conversation.session_id == session_id).order_by(Conversation.turn_number)
        )
        conversations = list(conversations_result.scalars().all())

        scores_result = await db.execute(select(Score).where(Score.session_id == session_id))
        scores = list(scores_result.scalars().all())

        legendary_name, strategy_notes = await ai_boss_service.generate_boss_profile(
            promptmon, conversations, scores
        )

        boss_battle = BossBattle(
            tournament_id=tournament.id,
            session_id=session_id,
            status=BossBattleStatus.IN_PROGRESS,
            legendary_promptmon_name=legendary_name,
            boss_strategy_notes=strategy_notes,
        )
        db.add(boss_battle)
        boss_battles.append(boss_battle)

    await db.commit()
    for bb in boss_battles:
        await db.refresh(bb)

    return boss_battles


async def _get_boss_battle_for_session(db: AsyncSession, boss_battle_id: uuid.UUID, session: Session) -> BossBattle:
    result = await db.execute(select(BossBattle).where(BossBattle.id == boss_battle_id))
    boss_battle = result.scalar_one_or_none()
    if boss_battle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Boss battle not found.")
    if boss_battle.session_id != session.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This is not your boss battle.")
    return boss_battle


async def get_current_boss_battle(db: AsyncSession, session: Session) -> CurrentBossBattleResponse:
    require_tournament_active(session.tournament)
    result = await db.execute(
        select(BossBattle)
        .where(BossBattle.session_id == session.id, BossBattle.tournament_id == session.tournament_id)
        .order_by(BossBattle.created_at.desc())
        .limit(1)
    )
    boss_battle = result.scalar_one_or_none()
    if boss_battle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Final Round battle found — you may not have qualified, or it hasn't started yet.",
        )

    promptmon = await _get_promptmon(db, session.id)

    turns_result = await db.execute(
        select(BossBattleConversation).where(BossBattleConversation.boss_battle_id == boss_battle.id)
    )
    turns_used = len(turns_result.scalars().all())

    return CurrentBossBattleResponse(
        boss_battle_id=boss_battle.id,
        status=boss_battle.status,
        legendary_promptmon_name=boss_battle.legendary_promptmon_name,
        your_promptmon=promptmon,
        your_turns_used=turns_used,
    )


async def submit_boss_battle_prompt(
    db: AsyncSession, session: Session, boss_battle_id: uuid.UUID, payload: BossBattlePromptCreate
) -> BossBattleConversation:
    require_tournament_active(session.tournament)
    boss_battle = await _get_boss_battle_for_session(db, boss_battle_id, session)

    if boss_battle.status != BossBattleStatus.IN_PROGRESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This boss battle has already finished.")

    history_result = await db.execute(
        select(BossBattleConversation)
        .where(BossBattleConversation.boss_battle_id == boss_battle.id)
        .order_by(BossBattleConversation.turn_number)
    )
    history = list(history_result.scalars().all())

    if len(history) >= MAX_TURNS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You've already used all {MAX_TURNS} prompts for this battle.",
        )

    promptmon = await _get_promptmon(db, session.id)

    gemini_response = await ai_boss_battle_service.generate_boss_turn_response(
        promptmon=promptmon,
        legendary_promptmon_name=boss_battle.legendary_promptmon_name,
        boss_strategy_notes=boss_battle.boss_strategy_notes or "",
        history=history,
        prompt_text=payload.prompt,
    )

    conversation = BossBattleConversation(
        boss_battle_id=boss_battle.id,
        turn_number=len(history) + 1,
        prompt=payload.prompt,
        gemini_response=gemini_response,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return conversation


async def finish_boss_battle(db: AsyncSession, session: Session, boss_battle_id: uuid.UUID) -> FinishBossBattleResponse:
    require_tournament_active(session.tournament)
    boss_battle = await _get_boss_battle_for_session(db, boss_battle_id, session)

    if boss_battle.status == BossBattleStatus.FINISHED:
        return await _build_finish_response(db, boss_battle)

    history_result = await db.execute(
        select(BossBattleConversation)
        .where(BossBattleConversation.boss_battle_id == boss_battle.id)
        .order_by(BossBattleConversation.turn_number)
    )
    history = list(history_result.scalars().all())

    if len(history) < MAX_TURNS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You must submit all {MAX_TURNS} prompts before the battle can be judged.",
        )

    promptmon = await _get_promptmon(db, session.id)

    verdict = await ai_boss_judge_service.judge_boss_battle(promptmon, boss_battle.legendary_promptmon_name, history)

    db.add(BossBattleScore(boss_battle_id=boss_battle.id, **verdict))

    boss_battle.status = BossBattleStatus.FINISHED
    boss_battle.finished_at = datetime.now(timezone.utc)

    await db.commit()

    return await _build_finish_response(db, boss_battle)


async def _build_finish_response(db: AsyncSession, boss_battle: BossBattle) -> FinishBossBattleResponse:
    result = await db.execute(select(BossBattleScore).where(BossBattleScore.boss_battle_id == boss_battle.id))
    score = result.scalar_one()

    return FinishBossBattleResponse(boss_battle_id=boss_battle.id, status=boss_battle.status, score=score)