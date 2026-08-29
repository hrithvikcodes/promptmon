import random

SCENARIO_POOL = [
    "A crumbling volcanic arena where lava rivers cut through the battlefield, sapping stamina from anyone careless enough to stand too close to the glow.",
    "A dense, fog-choked forest at midnight where visibility is near zero and every ability leaves an echo the opponent can hear coming.",
    "A floating sky arena above storm clouds, buffeted by lightning strikes that arrive at random and can supercharge or fry any attack caught in them.",
    "An ancient crumbling coliseum overtaken by ivy, where cracked pillars can be toppled onto opponents but also collapse platforms unpredictably.",
    "A frozen tundra battlefield where the ground itself is slowly cracking, forcing both fighters to keep moving or risk falling through the ice.",
]

TWIST_POOL = [
    "Each competitor's strongest attack (their Special Attack) is disabled for this battle.",
    "A sudden storm rolls in: fire and electric abilities are weakened, water and ice abilities are empowered.",
    "Both competitors' opponents have copied one random ability from their rival at the start of the battle.",
    "The battlefield shifts mid-fight from open plains to a cramped underground cavern, limiting large-scale attacks.",
    "Resources are scarce: each competitor may only use each named ability once during this battle.",
]


def pick_scenario() -> str:
    return random.choice(SCENARIO_POOL)


def pick_twist() -> str:
    return random.choice(TWIST_POOL)