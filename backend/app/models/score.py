import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Score(Base):
    """One row per participant per match. Round2/3: 25+30+15+10 = 80."""

    __tablename__ = "scores"
    __table_args__ = (
        UniqueConstraint("match_id", "session_id", name="uq_score_per_session_per_match"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    match_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False
    )

    prompt_quality: Mapped[float] = mapped_column(Float, nullable=False)  # /25
    strategy: Mapped[float] = mapped_column(Float, nullable=False)  # /30
    adaptability: Mapped[float] = mapped_column(Float, nullable=False)  # /15
    battle_performance: Mapped[float] = mapped_column(Float, nullable=False)  # /10
    total: Mapped[float] = mapped_column(Float, nullable=False)  # /80

    reasoning: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    match: Mapped["Match"] = relationship(back_populates="scores")
    session: Mapped["Session"] = relationship()