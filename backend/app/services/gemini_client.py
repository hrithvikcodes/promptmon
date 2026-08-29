from google import genai
from google.genai import errors as genai_errors
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings

_client: genai.Client | None = None


def get_gemini_client() -> genai.Client:
    """Lazily-created, reused across requests — avoids reconnecting per call."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


# Gemini occasionally returns 503 UNAVAILABLE under high demand — this is
# transient and expected to be retried, not a bug. Applies to every Gemini
# call in the app (creativity eval now, battle judge / boss later).
gemini_retry = retry(
    retry=retry_if_exception_type(genai_errors.ServerError),
    wait=wait_exponential(multiplier=1, min=2, max=20),
    stop=stop_after_attempt(4),
    reraise=True,
)