import json
from typing import Optional, Sequence

from app.models.conversation import Conversation
from app.models.promptmon import Promptmon
from app.services.groq_client import get_groq_client, groq_retry

TEXT_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = (
    "You are the official Battle Judge for the Promptmon: AI Battle Arena tournament. "
    "You are given two competitors' full battle transcripts from the same battle and "
    "must score EACH of them independently, then decide a winner. Never guess or declare "
    "a winner arbitrarily — base every score and the final verdict strictly on the "
    "evidence in the transcripts. Always return structured JSON with a full score "
    "breakdown and detailed reasoning for both sides, and a clear justification for the winner."
)

SCORE_CATEGORIES_PROMPT = (
    "Score each competitor on these categories:\n"
    "- prompt_quality (out of 25): clarity, specificity, and creativity of their prompts\n"
    "- strategy (out of 30): how well their choices exploited the scenario and their "
    "Promptmon's strengths, and worked around its weaknesses\n"
    "- adaptability (out of 15): how well they adjusted across turns as the battle unfolded\n"
    "- battle_performance (out of 10): how effective the narrated outcomes were for them overall\n"
)


def _format_conversation(history: Sequence[Conversation]) -> str:
    return "\n".join(
        f"Turn {c.turn_number} — Prompt: {c.prompt}\nOutcome: {c.gemini_response}"
        for c in history
    ) or "(no turns recorded)"


def _build_prompt(
    promptmon_a: Promptmon,
    promptmon_b: Promptmon,
    scenario: str,
    twist: Optional[str],
    history_a: Sequence[Conversation],
    history_b: Sequence[Conversation],
) -> str:
    twist_line = f"Twist in effect: {twist}\n" if twist else ""

    return (
        f"Battle scenario: {scenario}\n{twist_line}\n"
        f"Team A Promptmon: {promptmon_a.name} ({promptmon_a.type}) — "
        f"Abilities: {', '.join(promptmon_a.abilities)}; Special Attack: {promptmon_a.special_attack}\n"
        f"Team A transcript:\n{_format_conversation(history_a)}\n\n"
        f"Team B Promptmon: {promptmon_b.name} ({promptmon_b.type}) — "
        f"Abilities: {', '.join(promptmon_b.abilities)}; Special Attack: {promptmon_b.special_attack}\n"
        f"Team B transcript:\n{_format_conversation(history_b)}\n\n"
        f"{SCORE_CATEGORIES_PROMPT}\n"
        "Respond ONLY with JSON in this exact shape:\n"
        '{\n'
        '  "team_a": {"prompt_quality": <0-25>, "strategy": <0-30>, "adaptability": <0-15>, '
        '"battle_performance": <0-10>, "reasoning": "<paragraph>"},\n'
        '  "team_b": {"prompt_quality": <0-25>, "strategy": <0-30>, "adaptability": <0-15>, '
        '"battle_performance": <0-10>, "reasoning": "<paragraph>"},\n'
        '  "winner": "team_a" | "team_b"\n'
        '}'
    )


@groq_retry
async def judge_battle(
    promptmon_a: Promptmon,
    promptmon_b: Promptmon,
    scenario: str,
    twist: Optional[str],
    history_a: Sequence[Conversation],
    history_b: Sequence[Conversation],
) -> dict:
    client = get_groq_client()

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _build_prompt(promptmon_a, promptmon_b, scenario, twist, history_a, history_b),
            },
        ],
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)

    for side in ("team_a", "team_b"):
        s = data[side]
        s["prompt_quality"] = max(0.0, min(25.0, float(s["prompt_quality"])))
        s["strategy"] = max(0.0, min(30.0, float(s["strategy"])))
        s["adaptability"] = max(0.0, min(15.0, float(s["adaptability"])))
        s["battle_performance"] = max(0.0, min(10.0, float(s["battle_performance"])))
        s["total"] = s["prompt_quality"] + s["strategy"] + s["adaptability"] + s["battle_performance"]

    return data