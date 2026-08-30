// ============================================================
// FILE: src/App.jsx
// Root component — routes between pages via local state
// Flat structure: all files live directly in src/
// ============================================================
import React, { useState, useMemo } from "react";
import { C, FONT_IMPORT } from "./theme";
import { ArenaBackdrop } from "./components";

import LandingPage from "./LandingPage";
import AdminLoginPage from "./AdminLoginPage";
import UserRegisterPage from "./UserRegisterPage";
import CreatePromptmonPage from "./CreatePromptmonPage";
import LoadingPage from "./LoadingPage";
import WaitingLobbyPage from "./WaitingLobbyPage";
import AdminDashboardPage from "./AdminDashboardPage";

export default function App() {
  const [view, setView] = useState("landing");
  const [teamName, setTeamName] = useState("");
  const [promptmon, setPromptmon] = useState(null);

  const go = (v) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setView(v);
  };

  const page = useMemo(() => {
    switch (view) {
      case "landing":
        return <LandingPage go={go} />;
      case "adminLogin":
        return <AdminLoginPage go={go} />;
      case "userRegister":
        return <UserRegisterPage go={go} teamName={teamName} setTeamName={setTeamName} />;
      case "createPromptmon":
        return <CreatePromptmonPage go={go} teamName={teamName} setPromptmon={setPromptmon} />;
      case "loading":
        return <LoadingPage go={go} />;
      case "waitingLobby":
        return <WaitingLobbyPage go={go} teamName={teamName} promptmon={promptmon} />;
      case "adminDashboard":
        return <AdminDashboardPage go={go} />;
      default:
        return <LandingPage go={go} />;
    }
  }, [view, teamName, promptmon]);

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        body { margin: 0; }
        input[type="range"] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 999px;
          background: ${C.bgInput};
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${C.arc};
          cursor: pointer;
          border: 2px solid ${C.bgDeep};
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${C.arc};
          cursor: pointer;
          border: 2px solid ${C.bgDeep};
        }
        ::selection { background: ${C.ember}55; }
        input:focus, select:focus, textarea:focus {
          box-shadow: 0 0 0 2px ${C.arc}66;
          border-color: ${C.arc};
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <ArenaBackdrop />
      {page}
    </div>
  );
}