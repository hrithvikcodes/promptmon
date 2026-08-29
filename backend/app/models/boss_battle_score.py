import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class BossBattleScore(Base):
    """Final Round: 25+30+20+15+10 = 100."""

    __tablename__ = "boss_battle_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    boss_battle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("boss_battles.id"), nullable=False, unique=True
    )

    prompt_quality: Mapped[float] = mapped_column(Float, nullable=False)  # /25
    strategy: Mapped[float] = mapped_column(Float, nullable=False)  # /30
    creativity: Mapped[float] = mapped_column(Float, nullable=False)  # /20
    adaptability: Mapped[float] = mapped_column(Float, nullable=False)  # /15
    final_battle_performance: Mapped[float] = mapped_column(Float, nullable=False)  # /10
    total: Mapped[float] = mapped_column(Float, nullable=False)  # /100

    reasoning: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    boss_battle: Mapped["BossBattle"] = relationship(back_populates="score")