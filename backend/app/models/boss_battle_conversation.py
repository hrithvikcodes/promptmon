import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class BossBattleConversation(Base):
    __tablename__ = "boss_battle_conversations"
    __table_args__ = (
        UniqueConstraint("boss_battle_id", "turn_number", name="uq_boss_conversation_turn"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    boss_battle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("boss_battles.id"), nullable=False
    )
    turn_number: Mapped[int] = mapped_column(Integer, nullable=False)

    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    gemini_response: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    boss_battle: Mapped["BossBattle"] = relationship(back_populates="conversations")