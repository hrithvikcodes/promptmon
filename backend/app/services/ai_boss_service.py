import json
from typing import Sequence

from google.genai import types

from app.models.conversation import Conversation
from app.models.promptmon import Promptmon
from app.models.score import Score
from app.services.gemini_client import gemini_retry, get_gemini_client

TEXT_MODEL = "gemini-3.6-flash"

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


@gemini_retry
async def generate_boss_profile(
    promptmon: Promptmon, conversations: Sequence[Conversation], scores: Sequence[Score]
) -> tuple[str, str]:
    client = get_gemini_client()

    response = await client.aio.models.generate_content(
        model=TEXT_MODEL,
        contents=_build_prompt(promptmon, conversations, scores),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )

    data = json.loads(response.text)
    return str(data["legendary_promptmon_name"]), str(data["boss_strategy_notes"])