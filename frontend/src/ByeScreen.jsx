import { PartyPopper } from "lucide-react";
import { C } from "./theme.js";
import { Panel, GlowButton, ScreenTitle } from "./ui.jsx";

export default function ByeScreen({ onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <ScreenTitle eyebrow="No Opponent Available" title="You Advanced on a Bye" />
        <Panel glow={C.gold} className="flex flex-col items-center gap-4">
          <PartyPopper size={28} style={{ color: C.gold }} />
          <p style={{ color: C.textMuted }}>
            No opponent was available this round, so your team advances automatically.
          </p>
          <GlowButton variant="gold" onClick={onContinue}>Continue</GlowButton>
        </Panel>
      </div>
    </div>
  );
}