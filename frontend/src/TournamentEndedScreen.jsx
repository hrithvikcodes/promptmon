import { Flag } from "lucide-react";
import { C } from "./theme.js";
import { Panel, GlowButton, ScreenTitle } from "./ui.jsx";

export default function TournamentEndedScreen({ onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <ScreenTitle eyebrow="Season Zero" title="Tournament Has Ended" />
        <Panel glow={C.textMuted} className="flex flex-col items-center gap-4">
          <Flag size={28} style={{ color: C.textMuted }} />
          <p style={{ color: C.textMuted }}>
            This tournament is closed. Thanks for battling!
          </p>
          <GlowButton variant="ghost" onClick={onBack}>Back to Landing</GlowButton>
        </Panel>
      </div>
    </div>
  );
}