import React, { useState } from "react";
import { Play, Square, Users, Radio, Trophy } from "lucide-react";
import { C, DUMMY_TEAMS, DUMMY_PAIRINGS, DUMMY_LEADERBOARD } from "./theme";
import { TopBar, Panel, PrimaryButton, GhostButton, TypeBadge, StatusPill } from "./components";

export default function AdminDashboardPage({ go }) {
  const [status, setStatus] = useState("Waiting");

  return (
    <div className="min-h-screen px-5 sm:px-8 py-8 max-w-6xl mx-auto w-full">
      <TopBar onBack={() => go("landing")} backLabel="Log out" right={<StatusPill status={status} />} />

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
          Command Center
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          {DUMMY_TEAMS.length} teams registered
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <PrimaryButton icon={Play} disabled={status === "Running"} onClick={() => setStatus("Running")}>
          Start Contest
        </PrimaryButton>
        <GhostButton icon={Square} tone="danger" onClick={() => setStatus("Finished")}>
          End Contest
        </GhostButton>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Panel>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: C.arc }} />
            <h3 className="font-semibold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              Registered Teams
            </h3>
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {DUMMY_TEAMS.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg" style={{ background: C.bgInput }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.textPrimary }}>
                    {t.team}
                  </p>
                  <p className="text-xs truncate" style={{ color: C.textFaint }}>
                    {t.mon}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TypeBadge type={t.type} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2 mb-4">
            <Radio size={18} style={{ color: C.ember }} />
            <h3 className="font-semibold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              Round 1 Pairings
            </h3>
          </div>
          {status === "Waiting" ? (
            <p className="text-sm py-6 text-center" style={{ color: C.textFaint }}>
              Pairings will generate once the contest starts.
            </p>
          ) : (
            <div className="space-y-2.5">
              {DUMMY_PAIRINGS.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3.5 py-3 rounded-lg text-sm" style={{ background: C.bgInput }}>
                  <span className="font-medium truncate" style={{ color: C.textPrimary }}>
                    {p.a}
                  </span>
                  <span className="text-xs px-2" style={{ color: C.textFaint, fontFamily: "Rajdhani" }}>
                    VS
                  </span>
                  <span className="font-medium truncate text-right" style={{ color: C.textPrimary }}>
                    {p.b}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: C.ember }} />
          <h3 className="font-semibold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
            Leaderboard
          </h3>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr style={{ color: C.textFaint }}>
                <th className="text-left font-medium py-2 px-2">#</th>
                <th className="text-left font-medium py-2 px-2">Team</th>
                <th className="text-center font-medium py-2 px-2">W</th>
                <th className="text-center font-medium py-2 px-2">L</th>
                <th className="text-right font-medium py-2 px-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_LEADERBOARD.map((row) => (
                <tr key={row.rank} className="border-t" style={{ borderColor: C.hairlineSoft }}>
                  <td className="py-2.5 px-2" style={{ color: row.rank <= 3 ? C.ember : C.textMuted, fontFamily: "IBM Plex Mono" }}>
                    {row.rank}
                  </td>
                  <td className="py-2.5 px-2 font-medium" style={{ color: C.textPrimary }}>
                    {row.team}
                  </td>
                  <td className="py-2.5 px-2 text-center" style={{ color: C.success, fontFamily: "IBM Plex Mono" }}>
                    {row.wins}
                  </td>
                  <td className="py-2.5 px-2 text-center" style={{ color: C.danger, fontFamily: "IBM Plex Mono" }}>
                    {row.losses}
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold" style={{ color: C.textPrimary, fontFamily: "IBM Plex Mono" }}>
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}