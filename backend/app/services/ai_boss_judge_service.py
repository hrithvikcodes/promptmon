import json
from typing import Sequence

from google.genai import types

from app.models.boss_battle_conversation import BossBattleConversation
from app.models.promptmon import Promptmon
from app.services.gemini_client import gemini_retry, get_gemini_client

TEXT_MODEL = "gemini-3.6-flash"

SYSTEM_PROMPT = (
    "You are the official Final Boss Judge for the Promptmon: AI Battle Arena tournament. "
    "You are given one competitor's full battle transcript against the Legendary Promptmon "
    "boss and must score their performance. Never guess a score — base every number strictly "
    "on evidence in the transcript, and always give detailed reasoning."
)

SCORE_CATEGORIES_PROMPT = (
    "Score the competitor on these categories:\n"
    "- prompt_quality (out of 25)\n- strategy (out of 30)\n- creativity (out of 20)\n"
    "- adaptability (out of 15)\n- final_battle_performance (out of 10)\n"
)


def _format_history(history: Sequence[BossBattleConversation]) -> str:
    return "\n".join(
        f"Turn {c.turn_number} — Prompt: {c.prompt}\nOutcome: {c.gemini_response}" for c in history
    ) or "(no turns recorded)"


def _build_prompt(promptmon: Promptmon, legendary_promptmon_name: str, history: Sequence[BossBattleConversation]) -> str:
    return (
        f"Competitor's Promptmon: {promptmon.name} ({promptmon.type}) — "
        f"Abilities: {', '.join(promptmon.abilities)}; Special Attack: {promptmon.special_attack}\n"
        f"Legendary Promptmon (boss): {legendary_promptmon_name}\n\n"
        f"Full battle transcript:\n{_format_history(history)}\n\n"
        f"{SCORE_CATEGORIES_PROMPT}\n"
        "Respond ONLY with JSON in this exact shape:\n"
        '{"prompt_quality": <0-25>, "strategy": <0-30>, "creativity": <0-20>, '
        '"adaptability": <0-15>, "final_battle_performance": <0-10>, "reasoning": "<paragraph>"}'
    )


@gemini_retry
async def judge_boss_battle(
    promptmon: Promptmon, legendary_promptmon_name: str, history: Sequence[BossBattleConversation]
) -> dict:
    client = get_gemini_client()

    response = await client.aio.models.generate_content(
        model=TEXT_MODEL,
        contents=_build_prompt(promptmon, legendary_promptmon_name, history),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )

    data = json.loads(response.text)
    data["prompt_quality"] = max(0.0, min(25.0, float(data["prompt_quality"])))
    data["strategy"] = max(0.0, min(30.0, float(data["strategy"])))
    data["creativity"] = max(0.0, min(20.0, float(data["creativity"])))
    data["adaptability"] = max(0.0, min(15.0, float(data["adaptability"])))
    data["final_battle_performance"] = max(0.0, min(10.0, float(data["final_battle_performance"])))
    data["total"] = (
        data["prompt_quality"] + data["strategy"] + data["creativity"]
        + data["adaptability"] + data["final_battle_performance"]
    )
    return data