import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import TournamentStatus # pyright: ignore[reportAttributeAccessIssue]


class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    status: Mapped[TournamentStatus] = mapped_column(
        Enum(TournamentStatus, name="tournament_status"),
        default=TournamentStatus.WAITING,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    sessions: Mapped[List["Session"]] = relationship( # type: ignore
        back_populates="tournament", cascade="all, delete-orphan"
    )
    matches: Mapped[List["Match"]] = relationship( # type: ignore
        back_populates="tournament", cascade="all, delete-orphan"
    )
    boss_battles: Mapped[List["BossBattle"]] = relationship( # type: ignore
        back_populates="tournament", cascade="all, delete-orphan"
    )