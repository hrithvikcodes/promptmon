import { useCallback, useEffect, useState } from "react";
import { Shield, PlayCircle, Trophy, Flame, Square, Users, RotateCcw, ListOrdered } from "lucide-react";
import { api, ApiError } from "./api.js";
import { usePolling } from "./usePolling.js";
import { C } from "./theme.js";
import { Panel, GlowButton, ErrorText, ScreenTitle } from "./ui.jsx";

function StatusBadge({ status }) {
  const color = status === "running" ? C.arc : status === "finished" ? C.textMuted : C.gold;
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
      style={{ color, backgroundColor: `${color}1A`, border: `1px solid ${color}44` }}
    >
      {status ?? "unknown"}
    </span>
  );
}

export default function AdminPanel({ password, onBack }) {
  const [status, setStatus] = useState(null);
  const [teamCount, setTeamCount] = useState(null);
  const [teams, setTeams] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      setStatus(await api.getWaitingStatus());
    } catch {
      /* ignore */
    }
  }, []);
  usePolling(pollStatus, 5000);

  const refreshTeamCount = useCallback(async () => {
    try {
      const list = await api.getTeams(password);
      setTeamCount(list.length);
      return list;
    } catch {
      return null;
    }
  }, [password]);

  useEffect(() => {
    refreshTeamCount();
  }, [refreshTeamCount]);

  async function loadTeams() {
    setError(null);
    try {
      const list = await api.getTeams(password);
      setTeams(list);
      setTeamCount(list.length);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load teams");
    }
  }

  async function loadLeaderboard() {
    setError(null);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data.entries);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load leaderboard");
    }
  }

  async function run(action) {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      switch (action) {
        case "start": {
          const result = await api.startTournament(password);
          setMessage(
            result.action === "created_new_tournament"
              ? "New tournament created — teams must register again, then click this again to start Round 2."
              : result.message || "Round 2 started."
          );
          break;
        }
        case "round3": {
          const result = await api.startRound3(password);
          setMessage(`Round 3 started — ${result.length} matches created.`);
          break;
        }
        case "final": {
          await api.startFinal(password);
          setMessage("Boss battles started for Round 3 winners.");
          break;
        }
        case "end": {
          await api.endTournament(password);
          setMessage("Tournament ended.");
          break;
        }
      }
      pollStatus();
      refreshTeamCount();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetForEvent() {
    const confirmed = window.confirm(
      "This will end the current tournament and start a fresh one — any in-progress test battles will be abandoned. Continue?"
    );
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setResetting(true);
    try {
      try {
        await api.endTournament(password);
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 400)) {
          throw err;
        }
      }

      const startResult = await api.startTournament(password);
      const newTournament = startResult.tournament;

      await pollStatus();
      await refreshTeamCount();
      setLeaderboard(null);
      setTeams(null);

      setMessage(
        `Reset complete. New tournament ${newTournament?.id ?? ""} is ${newTournament?.status?.toUpperCase() ?? "WAITING"}.`
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-2xl">
        <ScreenTitle eyebrow="Arena Control" title="Admin Panel" />
        <Panel glow={C.arc} className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} style={{ color: C.arc }} />
            <StatusBadge status={status?.tournament_status} />
            <span style={{ color: C.textMuted }}>
              {status ? `${status.registered_teams_count} teams` : "Loading..."}
            </span>
          </div>

          <GlowButton variant="arc" disabled={busy || resetting} onClick={() => run("start")}>
            <PlayCircle size={16} className="inline mr-2" /> Start Tournament / Round 2
          </GlowButton>
          <GlowButton variant="gold" disabled={busy || resetting} onClick={() => run("round3")}>
            <Trophy size={16} className="inline mr-2" /> Start Round 3
          </GlowButton>
          <GlowButton variant="ember" disabled={busy || resetting} onClick={() => run("final")}>
            <Flame size={16} className="inline mr-2" /> Start Final (Boss Battles)
          </GlowButton>
          <GlowButton variant="ghost" disabled={busy || resetting} onClick={() => run("end")}>
            <Square size={16} className="inline mr-2" /> End Tournament
          </GlowButton>

          {message && <p className="text-sm text-center" style={{ color: C.gold }}>{message}</p>}
          <ErrorText>{error}</ErrorText>

          <GlowButton variant="ghost" onClick={loadTeams}>
            <Users size={16} className="inline mr-2" /> Load Teams
          </GlowButton>

          {teams && (
            <div className="max-h-52 overflow-y-auto flex flex-col gap-1 text-sm">
              {teams.map((t) => (
                <div key={t.session_id} className="flex justify-between px-2 py-1 rounded bg-white/5" style={{ color: C.textMuted }}>
                  <span>{t.team_name}</span>
                  <span>{t.has_promptmon ? t.promptmon_name : "no promptmon"}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="text-xs uppercase tracking-widest text-center" style={{ color: C.textFaint }}>
              Reset Tournament
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm" style={{ color: C.textMuted }}>Current team count:</span>
              <span
                className="text-lg font-bold px-3 py-0.5 rounded-full"
                style={{
                  color: teamCount === 0 ? C.arc : C.gold,
                  backgroundColor: `${teamCount === 0 ? C.arc : C.gold}1A`,
                }}
              >
                {teamCount === null ? "..." : teamCount}
              </span>
            </div>

            <GlowButton variant="ember" disabled={busy || resetting} onClick={handleResetForEvent}>
              <RotateCcw size={16} className="inline mr-2" />
              {resetting ? "Resetting..." : "Reset for Event"}
            </GlowButton>
            <p className="text-xs text-center" style={{ color: C.textFaint }}>
              Ends the current tournament and starts a fresh WAITING one. Verify the team count above reads 0 before opening registration.
            </p>
          </div>

          <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <ListOrdered size={14} style={{ color: C.gold }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: C.textFaint }}>
                Leaderboard
              </span>
            </div>

            <GlowButton variant="gold" onClick={loadLeaderboard}>
              Load Leaderboard
            </GlowButton>

            {leaderboard && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ color: C.textFaint }}>
                      <th className="text-left py-1 pr-2 font-normal">#</th>
                      <th className="text-left py-1 pr-2 font-normal">Team</th>
                      <th className="text-left py-1 pr-2 font-normal">Promptmon</th>
                      <th className="text-right py-1 pr-2 font-normal">Creativity</th>
                      <th className="text-right py-1 pr-2 font-normal">R2</th>
                      <th className="text-right py-1 pr-2 font-normal">R3</th>
                      <th className="text-right py-1 pr-2 font-normal">Boss</th>
                      <th className="text-right py-1 font-normal">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-3 text-center" style={{ color: C.textMuted }}>
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((e, i) => (
                        <tr key={e.session_id} className="border-t border-white/5">
                          <td className="py-1.5 pr-2" style={{ color: i === 0 ? C.gold : C.textMuted }}>{i + 1}</td>
                          <td className="py-1.5 pr-2" style={{ color: C.textPrimary }}>{e.team_name}</td>
                          <td className="py-1.5 pr-2" style={{ color: C.textMuted }}>{e.promptmon_name}</td>
                          <td className="py-1.5 pr-2 text-right" style={{ color: C.textMuted }}>{e.creativity_score}</td>
                          <td className="py-1.5 pr-2 text-right" style={{ color: C.textMuted }}>{e.round2_score}</td>
                          <td className="py-1.5 pr-2 text-right" style={{ color: C.textMuted }}>{e.round3_score}</td>
                          <td className="py-1.5 pr-2 text-right" style={{ color: C.textMuted }}>{e.boss_score}</td>
                          <td className="py-1.5 text-right font-bold" style={{ color: C.arc }}>{e.total}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <GlowButton variant="ghost" onClick={onBack}>Back to Landing</GlowButton>
        </Panel>
      </div>
    </div>
  );
}