from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.promptmon import Promptmon
from app.models.session import Session
from app.schemas.promptmon import PromptmonCreate
from app.services import creativity_evaluation_service
from app.services.tournament_service import require_waiting


async def create_promptmon(
    db: AsyncSession, session: Session, payload: PromptmonCreate
) -> Promptmon:
    require_waiting(session.tournament)

    existing = await db.execute(
        select(Promptmon).where(Promptmon.session_id == session.id)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This team has already created a Promptmon.",
        )

    promptmon = Promptmon(
        session_id=session.id,
        name=payload.name,
        type=payload.type,
        abilities=payload.abilities,
        stats=payload.stats,
        special_attack=payload.special_attack,
        strengths=payload.strengths,
        weaknesses=payload.weaknesses,
        backstory=payload.backstory,
    )
    db.add(promptmon)
    await db.commit()
    await db.refresh(promptmon)

    score, reasoning = await creativity_evaluation_service.evaluate_creativity(promptmon)
    promptmon.creativity_score = score
    promptmon.creativity_reasoning = reasoning
    await db.commit()
    await db.refresh(promptmon)

    return promptmon