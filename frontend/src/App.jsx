import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, ApiError } from "./api.js";
import { C } from "./theme.js";
import LandingPage from "./LandingPage.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminPanel from "./AdminPanel.jsx";
import UserRegister from "./UserRegister.jsx";
import PromptmonForm from "./PromptmonForm.jsx";
import WaitingRoom from "./WaitingRoom.jsx";
import PostRoundWait from "./PostRoundWait.jsx";
import BattleView from "./BattleView.jsx";
import BossBattleView from "./BossBattleView.jsx";
import ByeScreen from "./ByeScreen.jsx";
import EliminatedScreen from "./EliminatedScreen.jsx";
import TournamentEndedScreen from "./TournamentEndedScreen.jsx";
import ResultsView from "./ResultsView.jsx";
import LeaderboardView from "./LeaderboardView.jsx";

const SESSION_KEY = "session";

function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

function ResumingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <Loader2 size={24} className="animate-spin" style={{ color: C.arc }} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(loadSession());
  const [stage, setStage] = useState("landing");
  const [resuming, setResuming] = useState(!!loadSession());
  const [adminPassword, setAdminPassword] = useState("");
  const [result, setResult] = useState(null);
  const [isBossResult, setIsBossResult] = useState(false);
  const [lastMatchId, setLastMatchId] = useState(null);
  const [waitingForBoss, setWaitingForBoss] = useState(false);

  const go = (next) => setStage(next);
  const onTournamentEnded = () => go("tournamentEnded");

  function handleBattleFinished(finishResult, matchId, round, won) {
    setResult(finishResult);
    setIsBossResult(false);
    setLastMatchId(matchId);

    if (!won) {
      go("resultsEliminated");
      return;
    }
    setWaitingForBoss(round === "round3");
    go("results");
  }

  function handleBossFinished(finishResult) {
    setResult(finishResult);
    setIsBossResult(true);
    go("results");
  }

  async function resolveFinishedMatch(sessionId, match) {
    const finishResult = await api.finishBattle(sessionId, match.match_id);
    const won = finishResult.winner_session_id === sessionId;
    handleBattleFinished(finishResult, match.match_id, match.round, won);
  }

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      setResuming(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let waitingStatus = null;
        try {
          waitingStatus = await api.getWaitingStatus();
        } catch {
          /* non-fatal */
        }

        if (waitingStatus?.tournament_status === "finished") {
          if (!cancelled) go("tournamentEnded");
          return;
        }

        try {
          await api.getMyPromptmon(stored.id);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof ApiError && err.status === 401) {
            clearStoredSession();
            setSession(null);
            go("landing");
            return;
          }
          if (err instanceof ApiError && err.status === 403 && err.detail?.code === "TOURNAMENT_FINISHED") {
            go("tournamentEnded");
            return;
          }
          if (err instanceof ApiError && err.status === 404) {
            go("promptmon");
            return;
          }
          go("promptmon");
          return;
        }

        try {
          const match = await api.getCurrentMatch(stored.id);
          if (cancelled) return;

          if (match.status === "finished") {
            try {
              await resolveFinishedMatch(stored.id, match);
            } catch {
              if (!cancelled) {
                setLastMatchId(match.match_id);
                go("waitingNext");
              }
            }
          } else {
            go("battle");
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof ApiError && err.status === 401) {
            clearStoredSession();
            setSession(null);
            go("landing");
            return;
          }
          if (err instanceof ApiError && err.status === 403 && err.detail?.code === "TOURNAMENT_FINISHED") {
            go("tournamentEnded");
            return;
          }

          try {
            await api.getCurrentBossBattle(stored.id);
            if (!cancelled) go("bossBattle");
            return;
          } catch (bossErr) {
            if (cancelled) return;
            if (bossErr instanceof ApiError && bossErr.status === 401) {
              clearStoredSession();
              setSession(null);
              go("landing");
              return;
            }
          }

          if (waitingStatus?.tournament_status === "waiting") {
            go("waitingStart");
          } else {
            setLastMatchId(null);
            go("waitingNext");
          }
        }
      } finally {
        if (!cancelled) setResuming(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRegistered(newSession) {
    clearStoredSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    go("promptmon");
  }

  if (resuming) {
    return <ResumingScreen />;
  }

  switch (stage) {
    case "landing":
      return <LandingPage go={go} />;
    case "adminLogin":
      return <AdminLogin onSuccess={(pw) => { setAdminPassword(pw); go("adminPanel"); }} onBack={() => go("landing")} />;
    case "adminPanel":
      return <AdminPanel password={adminPassword} onBack={() => go("landing")} />;
    case "userRegister":
      return <UserRegister onRegistered={handleRegistered} onBack={() => go("landing")} />;
    case "promptmon":
      return <PromptmonForm sessionId={session.id} onCreated={() => go("waitingStart")} />;
    case "waitingStart":
      return <WaitingRoom onStarted={() => go("battle")} />;
    case "battle":
      return (
        <BattleView
          sessionId={session.id}
          onFinished={handleBattleFinished}
          onBye={() => go("bye")}
          onTournamentEnded={onTournamentEnded}
        />
      );
    case "bye":
      return <ByeScreen onContinue={() => go("waitingNext")} />;
    case "bossBattle":
      return (
        <BossBattleView
          sessionId={session.id}
          onFinished={handleBossFinished}
          onNotQualified={() => go("leaderboard")}
          onTournamentEnded={onTournamentEnded}
        />
      );
    case "results":
      return (
        <ResultsView
          sessionId={session.id}
          result={result}
          isBoss={isBossResult}
          onContinue={() => go(isBossResult ? "leaderboard" : "waitingNext")}
        />
      );
    case "resultsEliminated":
      return (
        <ResultsView
          sessionId={session.id}
          result={result}
          isBoss={false}
          onContinue={() => go("eliminated")}
        />
      );
    case "eliminated":
      return <EliminatedScreen onContinue={() => go("leaderboard")} />;
    case "waitingNext":
      return (
        <PostRoundWait
          sessionId={session.id}
          lastMatchId={lastMatchId}
          waitingForBoss={waitingForBoss}
          onNextMatch={() => go("battle")}
          onResolveFinished={resolveFinishedMatch}
          onBossReady={() => go("bossBattle")}
          onTournamentEnded={onTournamentEnded}
        />
      );
    case "leaderboard":
      return <LeaderboardView onBack={() => go("landing")} />;
    case "tournamentEnded":
      return <TournamentEndedScreen onBack={() => go("landing")} />;
    default:
      return <LandingPage go={go} />;
  }
}