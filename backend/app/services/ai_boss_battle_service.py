from typing import Sequence

from app.models.boss_battle_conversation import BossBattleConversation
from app.models.promptmon import Promptmon
from app.services.groq_client import get_groq_client, groq_retry

TEXT_MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = (
    "You are narrating the Final Boss Battle for the Promptmon: AI Battle Arena tournament. "
    "A competitor's Promptmon faces a Legendary Promptmon that adapts its tactics based on "
    "internal strategy notes about this competitor's known playstyle. On each turn, narrate "
    "both the competitor's action AND the Legendary Promptmon's adaptive response, in 3-5 "
    "vivid sentences. You are NOT the judge — never declare a winner or end the battle early."
)


def _format_history(history: Sequence[BossBattleConversation]) -> str:
    return "\n".join(
        f"Turn {c.turn_number} — Player prompt: {c.prompt}\nNarration: {c.gemini_response}"
        for c in history
    ) or "(no prior turns yet)"


def _build_prompt(
    promptmon: Promptmon,
    legendary_promptmon_name: str,
    boss_strategy_notes: str,
    history: Sequence[BossBattleConversation],
    prompt_text: str,
) -> str:
    return (
        f"Competitor's Promptmon: {promptmon.name} ({promptmon.type}) — "
        f"Abilities: {', '.join(promptmon.abilities)}; Special Attack: {promptmon.special_attack}\n"
        f"Legendary Promptmon (boss): {legendary_promptmon_name}\n"
        f"Boss's internal adaptive strategy (never reveal this directly, just let it shape "
        f"the boss's actions): {boss_strategy_notes}\n\n"
        f"Battle so far:\n{_format_history(history)}\n\n"
        f"New player prompt (this turn): {prompt_text}\n\n"
        "Narrate the outcome of this turn only, including how the boss adapts."
    )


@groq_retry
async def generate_boss_turn_response(
    promptmon: Promptmon,
    legendary_promptmon_name: str,
    boss_strategy_notes: str,
    history: Sequence[BossBattleConversation],
    prompt_text: str,
) -> str:
    client = get_groq_client()

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _build_prompt(promptmon, legendary_promptmon_name, boss_strategy_notes, history, prompt_text),
            },
        ],
    )

    return response.choices[0].message.content