import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import MatchRound, MatchStatus


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tournament_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tournaments.id"), nullable=False
    )
    round: Mapped[MatchRound] = mapped_column(
        Enum(MatchRound, name="match_round"), nullable=False
    )
    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus, name="match_status"),
        default=MatchStatus.IN_PROGRESS,
        nullable=False,
    )

    session_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False
    )
    session_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False
    )
    winner_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id")
    )

    scenario: Mapped[str] = mapped_column(Text, nullable=False)
    twist: Mapped[Optional[str]] = mapped_column(Text)  # round3 only

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    tournament: Mapped["Tournament"] = relationship(back_populates="matches")

    session_a: Mapped["Session"] = relationship(
        back_populates="matches_as_a", foreign_keys=[session_a_id]
    )
    session_b: Mapped["Session"] = relationship(
        back_populates="matches_as_b", foreign_keys=[session_b_id]
    )
    winner_session: Mapped[Optional["Session"]] = relationship(
        foreign_keys=[winner_session_id]
    )

    conversations: Mapped[List["Conversation"]] = relationship(
        back_populates="match", cascade="all, delete-orphan"
    )
    scores: Mapped[List["Score"]] = relationship(
        back_populates="match", cascade="all, delete-orphan"
    )