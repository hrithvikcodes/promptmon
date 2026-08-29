import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Session(Base):
    """
    A team's participation in ONE tournament. `id` is the session_id
    returned to the frontend on registration and sent with every request.
    """

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tournament_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tournaments.id"), nullable=False
    )
    team_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    tournament: Mapped["Tournament"] = relationship(back_populates="sessions")

    promptmon: Mapped[Optional["Promptmon"]] = relationship(
        back_populates="session", uselist=False, cascade="all, delete-orphan"
    )

    matches_as_a: Mapped[List["Match"]] = relationship(
        back_populates="session_a",
        foreign_keys="Match.session_a_id",
    )
    matches_as_b: Mapped[List["Match"]] = relationship(
        back_populates="session_b",
        foreign_keys="Match.session_b_id",
    )