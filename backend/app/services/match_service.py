import asyncio
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.tournament_service import require_tournament_active
from app.models.conversation import Conversation
from app.models.enums import MatchRound, MatchStatus, TournamentStatus
from app.models.match import Match
from app.models.promptmon import Promptmon
from app.models.score import Score
from app.models.session import Session
from app.models.tournament import Tournament
from app.schemas.match import BattlePromptCreate, CurrentMatchResponse, FinishBattleResponse
from app.services import battle_judge_service, battle_strategy_service
from app.services.battle_scenario import pick_scenario, pick_twist

MAX_TURNS = 1

async def get_match_status(db: AsyncSession, session: Session, match_id: uuid.UUID) -> dict:
    require_tournament_active(session.tournament)
    match = await _get_match_for_session(db, match_id, session)
    opponent_id = match.session_b_id if match.session_a_id == session.id else match.session_a_id

    your_turns_result = await db.execute(
        select(Conversation).where(Conversation.match_id == match.id, Conversation.session_id == session.id)
    )
    your_turns_used = len(your_turns_result.scalars().all())

    opponent_turns_result = await db.execute(
        select(Conversation).where(Conversation.match_id == match.id, Conversation.session_id == opponent_id)
    )
    opponent_turns_used = len(opponent_turns_result.scalars().all())

    return {
        "match_id": match.id,
        "status": match.status,
        "your_turns_used": your_turns_used,
        "opponent_turns_used": opponent_turns_used,
        "winner_session_id": match.winner_session_id,
    }

async def _get_promptmon(db: AsyncSession, session_id: uuid.UUID) -> Promptmon:
    result = await db.execute(select(Promptmon).where(Promptmon.session_id == session_id))
    promptmon = result.scalar_one_or_none()
    if promptmon is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This team never created a Promptmon.")
    return promptmon


async def _get_eligible_sessions(db: AsyncSession, tournament_id: uuid.UUID) -> list[Session]:
    result = await db.execute(
        select(Session).join(Promptmon, Promptmon.session_id == Session.id).where(
            Session.tournament_id == tournament_id
        )
    )
    return list(result.scalars().all())


async def start_tournament(db: AsyncSession, tournament: Tournament) -> dict:
    if tournament.status == TournamentStatus.FINISHED:
        # Per spec: clicking Start Tournament after the previous one ended
        # creates a brand new tournament (fresh WAITING state) rather than
        # erroring. Teams then register fresh sessions under it before the
        # admin calls this endpoint again to actually pair and start Round 2.
        new_tournament = Tournament(status=TournamentStatus.WAITING)
        db.add(new_tournament)
        await db.commit()
        await db.refresh(new_tournament)

        return {
            "action": "created_new_tournament",
            "tournament": new_tournament,
            "matches": [],
            "message": "Previous tournament had ended. A new tournament was created in WAITING "
                       "status — wait for teams to register, then call Start Tournament again.",
        }

    if tournament.status == TournamentStatus.RUNNING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament is already running.")

    sessions = await _get_eligible_sessions(db, tournament.id)
    if len(sessions) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Need at least 2 teams with a Promptmon to start the tournament.",
        )

    import random
    random.shuffle(sessions)

    matches: list[Match] = []
    i = 0
    while i + 1 < len(sessions):
        match = Match(
            tournament_id=tournament.id,
            round=MatchRound.ROUND_2,
            status=MatchStatus.IN_PROGRESS,
            session_a_id=sessions[i].id,
            session_b_id=sessions[i + 1].id,
            scenario=pick_scenario(),
        )
        db.add(match)
        matches.append(match)
        i += 2

    if len(sessions) % 2 == 1:
        bye_session = sessions[-1]
        bye_match = Match(
            tournament_id=tournament.id,
            round=MatchRound.ROUND_2,
            status=MatchStatus.FINISHED,
            session_a_id=bye_session.id,
            session_b_id=bye_session.id,
            scenario="Bye — no opponent available this round.",
            winner_session_id=bye_session.id,
        )
        db.add(bye_match)
        matches.append(bye_match)

    tournament.status = TournamentStatus.RUNNING
    await db.commit()
    for m in matches:
        await db.refresh(m)

    return {
        "action": "started_round_2",
        "tournament": tournament,
        "matches": matches,
        "message": f"Round 2 started with {len(matches)} match(es).",
    }


async def start_round_3(db: AsyncSession, tournament: Tournament) -> list[Match]:
    result = await db.execute(
        select(Match).where(Match.tournament_id == tournament.id, Match.round == MatchRound.ROUND_2)
    )
    round2_matches = list(result.scalars().all())

    if not round2_matches:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Round 2 hasn't started.")
    if any(m.status != MatchStatus.FINISHED for m in round2_matches):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All Round 2 matches must finish before Round 3 can start.",
        )

    winner_ids = [m.winner_session_id for m in round2_matches if m.winner_session_id]

    import random
    random.shuffle(winner_ids)

    matches: list[Match] = []
    i = 0
    while i + 1 < len(winner_ids):
        match = Match(
            tournament_id=tournament.id,
            round=MatchRound.ROUND_3,
            status=MatchStatus.IN_PROGRESS,
            session_a_id=winner_ids[i],
            session_b_id=winner_ids[i + 1],
            scenario=pick_scenario(),
            twist=pick_twist(),
        )
        db.add(match)
        matches.append(match)
        i += 2

    if len(winner_ids) % 2 == 1:
        bye_id = winner_ids[-1]
        bye_match = Match(
            tournament_id=tournament.id,
            round=MatchRound.ROUND_3,
            status=MatchStatus.FINISHED,
            session_a_id=bye_id,
            session_b_id=bye_id,
            scenario="Bye — no opponent available this round.",
            winner_session_id=bye_id,
        )
        db.add(bye_match)
        matches.append(bye_match)

    await db.commit()
    for m in matches:
        await db.refresh(m)

    return matches


async def _get_match_for_session(db: AsyncSession, match_id: uuid.UUID, session: Session) -> Match:
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found.")
    if session.id not in (match.session_a_id, match.session_b_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not in this match.")
    return match


async def get_current_match(db: AsyncSession, session: Session) -> CurrentMatchResponse:
    require_tournament_active(session.tournament)
    result = await db.execute(
        select(Match)
        .where(or_(Match.session_a_id == session.id, Match.session_b_id == session.id))
        .where(Match.tournament_id == session.tournament_id)
        .order_by(Match.created_at.desc())
        .limit(1)
    )
    match = result.scalar_one_or_none()
    if match is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No match found yet — wait for the admin to start the tournament.",
        )

    opponent_id = match.session_b_id if match.session_a_id == session.id else match.session_a_id

    own_promptmon = await _get_promptmon(db, session.id)
    opponent_promptmon = await _get_promptmon(db, opponent_id)

    turns_result = await db.execute(
        select(Conversation).where(Conversation.match_id == match.id, Conversation.session_id == session.id)
    )
    your_turns_used = len(turns_result.scalars().all())

    return CurrentMatchResponse(
        match_id=match.id,
        round=match.round,
        status=match.status,
        scenario=match.scenario,
        twist=match.twist,
        your_promptmon=own_promptmon,
        opponent_promptmon=opponent_promptmon,
        your_turns_used=your_turns_used,
        winner_session_id=match.winner_session_id,
    )


async def submit_battle_prompt(
    db: AsyncSession, session: Session, match_id: uuid.UUID, payload: BattlePromptCreate
) -> Conversation:
    require_tournament_active(session.tournament)
    match = await _get_match_for_session(db, match_id, session)

    if match.status != MatchStatus.IN_PROGRESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This battle has already finished.")

    existing_result = await db.execute(
        select(Conversation)
        .where(Conversation.match_id == match.id, Conversation.session_id == session.id)
        .order_by(Conversation.turn_number)
    )
    history = list(existing_result.scalars().all())

    if len(history) >= MAX_TURNS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You've already used all {MAX_TURNS} prompts for this battle.",
        )

    opponent_id = match.session_b_id if match.session_a_id == session.id else match.session_a_id
    own_promptmon = await _get_promptmon(db, session.id)
    opponent_promptmon = await _get_promptmon(db, opponent_id)

    gemini_response = await battle_strategy_service.generate_turn_response(
        own_promptmon=own_promptmon,
        opponent_promptmon=opponent_promptmon,
        scenario=match.scenario,
        twist=match.twist,
        history=history,
        prompt_text=payload.prompt,
    )

    conversation = Conversation(
        match_id=match.id,
        session_id=session.id,
        turn_number=len(history) + 1,
        prompt=payload.prompt,
        gemini_response=gemini_response,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return conversation


async def finish_battle(db: AsyncSession, session: Session, match_id: uuid.UUID) -> FinishBattleResponse:
    match = await _get_match_for_session(db, match_id, session)

    if match.status == MatchStatus.FINISHED:
        return await _build_finish_response(db, match, session)

    # Atomic claim: only one concurrent caller can flip this row from
    # IN_PROGRESS to a transitional "claimed" state. Uses a plain UPDATE...
    # WHERE so the DB itself enforces the race, not application logic.
    claim_result = await db.execute(
        update(Match)
        .where(Match.id == match.id, Match.status == MatchStatus.IN_PROGRESS)
        .values(status=MatchStatus.FINISHED)  # optimistic pre-claim; overwritten with real data below
        .returning(Match.id)
    )
    await db.commit()
    claimed = claim_result.first() is not None

    if not claimed:
        # Someone else's request won the race and is judging right now (or
        # just finished). Poll briefly for their result instead of calling
        # Gemini a second time.
        for _ in range(10):
            await db.refresh(match)
            if match.status == MatchStatus.FINISHED:
                return await _build_finish_response(db, match, session)
            await asyncio.sleep(0.5)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Battle is still being judged, try again shortly.")

    # We won the claim — proceed with the one real judge call.
    history_a_result = await db.execute(
        select(Conversation)
        .where(Conversation.match_id == match.id, Conversation.session_id == match.session_a_id)
        .order_by(Conversation.turn_number)
    )
    history_a = list(history_a_result.scalars().all())

    history_b_result = await db.execute(
        select(Conversation)
        .where(Conversation.match_id == match.id, Conversation.session_id == match.session_b_id)
        .order_by(Conversation.turn_number)
    )
    history_b = list(history_b_result.scalars().all())

    if len(history_a) < MAX_TURNS or len(history_b) < MAX_TURNS:
        # Not actually ready — undo our claim so a real /finish call later can proceed.
        match.status = MatchStatus.IN_PROGRESS
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both players must submit all 3 prompts before the battle can be judged.",
        )

    promptmon_a = await _get_promptmon(db, match.session_a_id)
    promptmon_b = await _get_promptmon(db, match.session_b_id)

    verdict = await battle_judge_service.judge_battle(
        promptmon_a=promptmon_a, promptmon_b=promptmon_b,
        scenario=match.scenario, twist=match.twist,
        history_a=history_a, history_b=history_b,
    )

    winner_id = match.session_a_id if verdict["winner"] == "team_a" else match.session_b_id

    db.add(Score(match_id=match.id, session_id=match.session_a_id, **verdict["team_a"]))
    db.add(Score(match_id=match.id, session_id=match.session_b_id, **verdict["team_b"]))

    match.winner_session_id = winner_id
    match.finished_at = datetime.now(timezone.utc)
    # status already set to FINISHED by the claim above

    await db.commit()

    return await _build_finish_response(db, match, session)


async def _build_finish_response(db: AsyncSession, match: Match, session: Session) -> FinishBattleResponse:
    scores_result = await db.execute(select(Score).where(Score.match_id == match.id))
    scores = {s.session_id: s for s in scores_result.scalars().all()}

    opponent_id = match.session_b_id if match.session_a_id == session.id else match.session_a_id

    return FinishBattleResponse(
        match_id=match.id,
        status=match.status,
        winner_session_id=match.winner_session_id,
        your_score=scores[session.id],
        opponent_score=scores[opponent_id],
    )