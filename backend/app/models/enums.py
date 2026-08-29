import enum


class TournamentStatus(str, enum.Enum):
    WAITING = "waiting"
    RUNNING = "running"
    FINISHED = "finished"


class MatchRound(str, enum.Enum):
    ROUND_2 = "round2"
    ROUND_3 = "round3"


class MatchStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class BossBattleStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"