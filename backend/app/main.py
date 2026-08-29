from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.database.session import engine
from app.routers import admin, boss_battle, leaderboard, match, promptmon, session, tournament

from fastapi.middleware.cors import CORSMiddleware
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Runs on container shutdown (SIGTERM from Render during redeploys/restarts).
    # Without this, connections can leak / linger against Supabase's pooler,
    # which has a limited connection cap shared across your whole project.
    await engine.dispose()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://172.19.255.104:5173", "https://promptmon.pages.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(promptmon.router)
app.include_router(tournament.router)
app.include_router(admin.router)
app.include_router(match.router)
app.include_router(boss_battle.router)
app.include_router(leaderboard.router)



@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.ENVIRONMENT}