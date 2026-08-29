import json

from google.genai import types

from app.models.promptmon import Promptmon
from app.services.gemini_client import gemini_retry, get_gemini_client

TEXT_MODEL = "gemini-3.6-flash"

SYSTEM_PROMPT = (
    "You are the Creativity Judge for the Promptmon: AI Battle Arena tournament. "
    "Your ONLY job is to evaluate how original, imaginative, and well-thought-out a "
    "submitted Promptmon concept is — not how strong or battle-viable it is. "
    "Score creativity out of 20. Always return structured JSON with a numeric score "
    "and a short, specific written justification. Never leave reasoning blank, and "
    "never declare a score without explaining what drove it."
)


def _build_prompt(promptmon: Promptmon) -> str:
    return (
        "Evaluate the creativity of this Promptmon concept.\n\n"
        f"Name: {promptmon.name}\n"
        f"Type: {promptmon.type}\n"
        f"Abilities: {', '.join(promptmon.abilities)}\n"
        f"Stats: {promptmon.stats}\n"
        f"Special Attack: {promptmon.special_attack}\n"
        f"Strengths: {', '.join(promptmon.strengths)}\n"
        f"Weaknesses: {', '.join(promptmon.weaknesses)}\n"
        f"Backstory: {promptmon.backstory}\n\n"
        'Respond ONLY with JSON in this exact shape: '
        '{"creativity_score": <number 0-20>, "reasoning": "<short paragraph>"}'
    )


@gemini_retry
async def evaluate_creativity(promptmon: Promptmon) -> tuple[float, str]:
    client = get_gemini_client()

    response = await client.aio.models.generate_content(
        model=TEXT_MODEL,
        contents=_build_prompt(promptmon),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )

    data = json.loads(response.text)
    score = max(0.0, min(20.0, float(data["creativity_score"])))
    reasoning = str(data["reasoning"])

    return score, reasoning