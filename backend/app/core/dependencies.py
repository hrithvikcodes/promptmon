import uuid

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_db
from app.models.session import Session

session_id_header = APIKeyHeader(name="X-Session-ID", auto_error=True)


async def get_current_session(
    session_id: str = Depends(session_id_header),
    db: AsyncSession = Depends(get_db),
) -> Session:
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session_id format.")

    result = await db.execute(select(Session).where(Session.id == session_uuid))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Session not found — register a team first."
        )

    await db.refresh(session, attribute_names=["tournament"])
    return session


async def require_admin(x_admin_password: str = Header(...)) -> None:
    """
    No JWT, per spec — admin just sends the shared password on every
    admin-only request via this header.
    """
    if x_admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin password.")