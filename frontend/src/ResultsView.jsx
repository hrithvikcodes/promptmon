import { Trophy } from "lucide-react";
import { C } from "./theme.js";
import { Panel, GlowButton, ScreenTitle } from "./ui.jsx";

export default function ResultsView({ sessionId, result, isBoss, onContinue }) {
  if (isBoss) {
    const { score } = result;
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="w-full max-w-lg">
          <ScreenTitle eyebrow="Tournament Complete" title="Final Battle Scored" />
          <Panel glow={C.gold} className="flex flex-col gap-4">
            <Trophy size={28} style={{ color: C.gold, margin: "0 auto" }} />
            <p className="text-3xl font-bold text-center" style={{ color: C.gold }}>{score.total} / 100</p>
            <p className="text-sm text-center" style={{ color: C.textMuted }}>{score.reasoning}</p>
            <GlowButton variant="gold" onClick={onContinue}>View Leaderboard</GlowButton>
          </Panel>
        </div>
      </div>
    );
  }

  const isDraw = !result.winner_session_id;
  const youWon = result.winner_session_id === sessionId;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-lg">
        <ScreenTitle eyebrow="Battle Concluded" title={isDraw ? "Draw" : youWon ? "Victory!" : "Defeated"} />
        <Panel glow={youWon ? C.gold : C.ember} className="flex flex-col gap-4">
          <Trophy size={28} style={{ color: isDraw ? C.textMuted : youWon ? C.gold : C.ember, margin: "0 auto" }} />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest" style={{ color: C.textFaint }}>Your Score</p>
              <p className="text-2xl font-bold" style={{ color: C.arc }}>{result.your_score.total}</p>
              <p className="text-sm mt-1" style={{ color: C.textMuted }}>{result.your_score.reasoning}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest" style={{ color: C.textFaint }}>Opponent Score</p>
              <p className="text-2xl font-bold" style={{ color: C.ember }}>{result.opponent_score.total}</p>
              <p className="text-sm mt-1" style={{ color: C.textMuted }}>{result.opponent_score.reasoning}</p>
            </div>
          </div>
          <GlowButton variant="arc" onClick={onContinue}>Continue</GlowButton>
        </Panel>
      </div>
    </div>
  );
}