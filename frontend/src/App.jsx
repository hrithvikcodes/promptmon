import { useState } from "react";
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

function loadSession() {
  const raw = localStorage.getItem("session");
  return raw ? JSON.parse(raw) : null;
}

export default function App() {
  const [stage, setStage] = useState("landing");
  const [session, setSession] = useState(loadSession());
  const [adminPassword, setAdminPassword] = useState("");
  const [result, setResult] = useState(null);
  const [isBossResult, setIsBossResult] = useState(false);
  const [lastMatchId, setLastMatchId] = useState(null);
  const [waitingForBoss, setWaitingForBoss] = useState(false);

  const go = (next) => setStage(next);
  const onTournamentEnded = () => go("tournamentEnded");

  function handleRegistered(newSession) {
    localStorage.setItem("session", JSON.stringify(newSession));
    setSession(newSession);
    go("promptmon");
  }

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
          onEliminated={() => go("eliminated")}
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