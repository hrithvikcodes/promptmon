import { Skull } from "lucide-react";
import { C } from "./theme.js";
import { Panel, GlowButton, ScreenTitle } from "./ui.jsx";

export default function EliminatedScreen({ onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <ScreenTitle eyebrow="Tournament" title="Eliminated" />
        <Panel glow={C.ember} className="flex flex-col items-center gap-4">
          <Skull size={28} style={{ color: C.ember }} />
          <p style={{ color: C.textMuted }}>
            Your run ends here — you didn't advance to the next round.
          </p>
          <GlowButton variant="ember" onClick={onContinue}>View Leaderboard</GlowButton>
        </Panel>
      </div>
    </div>
  );
}