from openai import APIStatusError, AsyncOpenAI
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.core.config import settings

_client: AsyncOpenAI | None = None


def get_groq_client() -> AsyncOpenAI:
    """Lazily-created, reused across requests — avoids reconnecting per call."""
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=settings.GROQ_API_KEY,
        )
    return _client


def _is_retryable_groq_error(exc: BaseException) -> bool:
    """Retry on Groq/OpenAI-compatible 5xx errors — transient and expected,
    not a bug. Mirrors the old genai ServerError retry behavior, but the
    OpenAI SDK folds all non-2xx responses into APIStatusError, so we filter
    on status_code instead of a dedicated 5xx exception type."""
    return isinstance(exc, APIStatusError) and exc.status_code >= 500


# Groq occasionally returns 5xx under high demand — this is transient and
# expected to be retried, not a bug. Applies to every Groq call in the app
# (creativity eval now, battle judge / boss later).
groq_retry = retry(
    retry=retry_if_exception(_is_retryable_groq_error),
    wait=wait_exponential(multiplier=1, min=2, max=20),
    stop=stop_after_attempt(4),
    reraise=True,
)