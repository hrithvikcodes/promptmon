import json

from app.models.promptmon import Promptmon
from app.services.groq_client import get_groq_client, groq_retry

TEXT_MODEL = "openai/gpt-oss-120b"

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


@groq_retry
async def evaluate_creativity(promptmon: Promptmon) -> tuple[float, str]:
    client = get_groq_client()

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_prompt(promptmon)},
        ],
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    score = max(0.0, min(20.0, float(data["creativity_score"])))
    reasoning = str(data["reasoning"])

    return score, reasoning