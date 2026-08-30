import React from "react";
import { C, TYPES } from "./theme";
import { Panel, TypeBadge } from "./components";

export default function WaitingLobbyPage({ go, teamName, promptmon }) {
  const mon = promptmon || { name: "Unnamed Promptmon", type: "Fire" };
  const typeInfo = TYPES[mon.type];
  const creativityScore = 84;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest" style={{ color: C.textFaint, fontFamily: "Rajdhani" }}>
            {teamName || "Your Squad"}
          </span>
        </div>

        <Panel style={{ borderColor: typeInfo.color + "55" }}>
          <div className="flex justify-center mb-5">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center border relative overflow-hidden" style={{ background: C.bgInput, borderColor: C.hairlineSoft }}>
              <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle, ${typeInfo.color}55, transparent 70%)` }} />
              {React.createElement(typeInfo.icon, { size: 56, style: { color: typeInfo.color, position: "relative" } })}
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-xl font-bold mb-1" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              {mon.name}
            </h2>
            <TypeBadge type={mon.type} size="sm" />
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-5" style={{ background: C.bgInput }}>
            <span className="text-sm" style={{ color: C.textMuted }}>
              Creativity Score
            </span>
            <span className="text-lg font-bold" style={{ color: C.ember, fontFamily: "IBM Plex Mono" }}>
              {creativityScore}
              <span className="text-xs" style={{ color: C.textFaint }}>
                /100
              </span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.arc }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: C.arc }} />
            </span>
            <span className="text-sm font-medium" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              Waiting for tournament to start&hellip;
            </span>
          </div>
        </Panel>

        <button onClick={() => go("landing")} className="w-full text-center text-xs mt-6" style={{ color: C.textFaint }}>
          Exit to main screen
        </button>
      </div>
    </div>
  );
}