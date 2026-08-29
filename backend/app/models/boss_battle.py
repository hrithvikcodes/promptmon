import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import BossBattleStatus


class BossBattle(Base):
    __tablename__ = "boss_battles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tournament_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tournaments.id"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False
    )
    status: Mapped[BossBattleStatus] = mapped_column(
        Enum(BossBattleStatus, name="boss_battle_status"),
        default=BossBattleStatus.IN_PROGRESS,
        nullable=False,
    )

    rank_entering_final: Mapped[Optional[int]] = mapped_column(Integer)  # 1, 2, or 3
    legendary_promptmon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    boss_strategy_notes: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    tournament: Mapped["Tournament"] = relationship(back_populates="boss_battles")
    session: Mapped["Session"] = relationship()

    conversations: Mapped[List["BossBattleConversation"]] = relationship(
        back_populates="boss_battle", cascade="all, delete-orphan"
    )
    score: Mapped[Optional["BossBattleScore"]] = relationship(
        back_populates="boss_battle", uselist=False, cascade="all, delete-orphan"
    )