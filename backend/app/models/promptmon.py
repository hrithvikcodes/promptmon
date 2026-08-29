import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Promptmon(Base):
    __tablename__ = "promptmons"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False, unique=True
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)

    abilities: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    stats: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    strengths: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    weaknesses: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    special_attack: Mapped[str] = mapped_column(String(200), nullable=False)
    backstory: Mapped[str] = mapped_column(Text, nullable=False)

    image_url: Mapped[Optional[str]] = mapped_column(String(500))

    creativity_score: Mapped[Optional[float]] = mapped_column(Float)  # out of 20
    creativity_reasoning: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    session: Mapped["Session"] = relationship(back_populates="promptmon")