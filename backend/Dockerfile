FROM python:3.13-slim

# Install uv (fast Python package manager) via the official standalone binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy dependency files first so this layer is cached unless deps change
COPY pyproject.toml README.md ./

# Install deps into a project-local venv (uv's default behavior)
RUN uv sync --no-dev --no-install-project

# Now copy the actual application code
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./alembic.ini

# Install the project itself (picks up app/ as the local package)
RUN uv sync --no-dev

# Render sets $PORT at runtime — must bind to it, not a hardcoded port.
# Using sh -c so the shell expands the $PORT env var at container start.
CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]