from typing import Optional, Sequence

from google.genai import types

from app.models.conversation import Conversation
from app.models.promptmon import Promptmon
from app.services.gemini_client import gemini_retry, get_gemini_client

TEXT_MODEL = "gemini-3.6-flash"

SYSTEM_PROMPT = (
    "You are the Battle Narrator for the Promptmon: AI Battle Arena tournament. "
    "A competitor issues a prompt describing an action their Promptmon takes; you "
    "narrate the outcome of that single turn in 2-4 vivid sentences, grounded in "
    "the Promptmon's actual stats, abilities, and the battle conditions given. "
    "You are NOT the judge — never declare a winner, never end the battle early, "
    "and never say one side has 'won' the fight. Just narrate what happens on this "
    "turn, staying consistent with anything already narrated earlier in this battle."
)


def _build_context(
    own_promptmon: Promptmon,
    opponent_promptmon: Promptmon,
    scenario: str,
    twist: Optional[str],
    history: Sequence[Conversation],
    prompt_text: str,
) -> str:
    history_text = "\n".join(
        f"Turn {c.turn_number} — Player prompt: {c.prompt}\nNarration: {c.gemini_response}"
        for c in history
    ) or "(no prior turns yet)"

    twist_line = f"Twist in effect: {twist}\n" if twist else ""

    return (
        f"Battle scenario: {scenario}\n"
        f"{twist_line}"
        f"Your Promptmon: {own_promptmon.name} ({own_promptmon.type}) — "
        f"Abilities: {', '.join(own_promptmon.abilities)}; "
        f"Special Attack: {own_promptmon.special_attack}; "
        f"Strengths: {', '.join(own_promptmon.strengths)}; "
        f"Weaknesses: {', '.join(own_promptmon.weaknesses)}\n"
        f"Opponent Promptmon: {opponent_promptmon.name} ({opponent_promptmon.type}) — "
        f"Abilities: {', '.join(opponent_promptmon.abilities)}\n\n"
        f"Battle so far:\n{history_text}\n\n"
        f"New player prompt (this turn): {prompt_text}\n\n"
        "Narrate the outcome of this turn only."
    )


@gemini_retry
async def generate_turn_response(
    own_promptmon: Promptmon,
    opponent_promptmon: Promptmon,
    scenario: str,
    twist: Optional[str],
    history: Sequence[Conversation],
    prompt_text: str,
) -> str:
    client = get_gemini_client()

    response = await client.aio.models.generate_content(
        model=TEXT_MODEL,
        contents=_build_context(own_promptmon, opponent_promptmon, scenario, twist, history, prompt_text),
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    )

    return response.text