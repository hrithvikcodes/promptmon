import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { api } from "./api.js";
import { C } from "./theme.js";
import { Panel, GlowButton, ScreenTitle } from "./ui.jsx";

export default function LeaderboardView({ onBack }) {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    api.getLeaderboard().then((d) => setEntries(d.entries)).catch(() => setEntries([]));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-lg">
        <ScreenTitle eyebrow="Final Standings" title="Leaderboard" />
        <Panel glow={C.gold} className="flex flex-col gap-2">
          {!entries ? (
            <p style={{ color: C.textMuted }}>Loading...</p>
          ) : (
            entries.map((e, i) => (
              <div key={e.session_id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  {i === 0 && <Crown size={14} style={{ color: C.gold }} />}
                  <span style={{ color: C.textPrimary }}>{i + 1}. {e.team_name}</span>
                </div>
                <span className="font-bold" style={{ color: C.arc }}>{e.total}</span>
              </div>
            ))
          )}
          <GlowButton variant="ghost" onClick={onBack}>Back to Landing</GlowButton>
        </Panel>
      </div>
    </div>
  );
}