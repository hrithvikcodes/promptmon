import json
from typing import Sequence

from app.models.conversation import Conversation
from app.models.promptmon import Promptmon
from app.models.score import Score
from app.services.groq_client import get_groq_client, groq_retry

TEXT_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = (
    "You are the Final Boss Architect for the Promptmon: AI Battle Arena tournament. "
    "Given a finalist's Promptmon and their full battle history (past prompts and "
    "outcomes), design a Legendary Promptmon boss and a short internal strategy note "
    "on how it should adapt to counter this specific competitor's playstyle. This is "
    "internal planning only — it will guide the boss's behavior during the battle but "
    "is never shown to the competitor."
)


def _format_history(conversations: Sequence[Conversation]) -> str:
    return "\n".join(
        f"- Prompt: {c.prompt}\n  Outcome: {c.gemini_response}" for c in conversations
    ) or "(no prior battle history)"


def _build_prompt(promptmon: Promptmon, conversations: Sequence[Conversation], scores: Sequence[Score]) -> str:
    score_summary = "\n".join(
        f"- prompt_quality={s.prompt_quality}, strategy={s.strategy}, "
        f"adaptability={s.adaptability}, battle_performance={s.battle_performance}, total={s.total}"
        for s in scores
    ) or "(no prior scores)"

    return (
        f"Finalist's Promptmon: {promptmon.name} ({promptmon.type}) — "
        f"Abilities: {', '.join(promptmon.abilities)}; Special Attack: {promptmon.special_attack}; "
        f"Strengths: {', '.join(promptmon.strengths)}; Weaknesses: {', '.join(promptmon.weaknesses)}\n\n"
        f"Their past prompts and outcomes across the tournament:\n{_format_history(conversations)}\n\n"
        f"Their past judge scores:\n{score_summary}\n\n"
        'Respond ONLY with JSON in this exact shape: '
        '{"legendary_promptmon_name": "<name>", "boss_strategy_notes": "<2-4 sentences>"}'
    )


@groq_retry
async def generate_boss_profile(
    promptmon: Promptmon, conversations: Sequence[Conversation], scores: Sequence[Score]
) -> tuple[str, str]:
    client = get_groq_client()

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_prompt(promptmon, conversations, scores)},
        ],
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return str(data["legendary_promptmon_name"]), str(data["boss_strategy_notes"])