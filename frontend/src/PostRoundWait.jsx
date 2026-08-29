import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, ApiError, isTournamentFinished } from "./api.js";
import { usePolling } from "./usePolling.js";
import { C } from "./theme.js";
import { Panel, ScreenTitle } from "./ui.jsx";

export default function PostRoundWait({
  sessionId,
  lastMatchId,
  waitingForBoss,
  onNextMatch,
  onEliminated,
  onBossReady,
  onTournamentEnded,
}) {
  const [note, setNote] = useState(
    waitingForBoss
      ? "You're a finalist! Waiting for the admin to start the final battle..."
      : "Waiting for the next round to begin..."
  );

  const poll = useCallback(async () => {
    if (waitingForBoss) {
      try {
        await api.getCurrentBossBattle(sessionId);
        onBossReady();
      } catch (err) {
        if (isTournamentFinished(err)) {
          onTournamentEnded?.();
          return;
        }
        if (!(err instanceof ApiError && err.status === 404)) {
          setNote("Trouble reaching the server — retrying...");
        }
      }
      return;
    }

    try {
      const match = await api.getCurrentMatch(sessionId);

      if (match.match_id === lastMatchId) return;

      if (match.status === "finished") {
        if (match.winner_session_id === sessionId) {
          onNextMatch(match);
        } else {
          onEliminated();
        }
        return;
      }

      onNextMatch(match);
    } catch (err) {
      if (isTournamentFinished(err)) {
        onTournamentEnded?.();
        return;
      }
      /* no new match yet, keep waiting */
    }
  }, [sessionId, lastMatchId, waitingForBoss, onNextMatch, onEliminated, onBossReady, onTournamentEnded]);

  usePolling(poll, 6000);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <ScreenTitle eyebrow="Standby" title="Between Rounds" />
        <Panel glow={C.gold} className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: C.gold }} />
          <p style={{ color: C.textMuted }}>{note}</p>
        </Panel>
      </div>
    </div>
  );
}