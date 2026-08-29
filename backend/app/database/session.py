from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,   # checks connection is alive before using it — Supabase's
                          # pooler can silently drop idle connections; without this
                          # you get random "connection closed" errors after idle time
    pool_size=5,          # small pool — Supabase's session pooler itself has a
                          # limited connection cap; don't let this app hog it
    max_overflow=5,
    pool_recycle=1800,    # recycle connections every 30 min, avoids stale-connection
                          # issues on long-running containers
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session