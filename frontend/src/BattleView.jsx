import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Zap, Shield, Sword, Sparkles } from "lucide-react";
import { api, ApiError, isTournamentFinished } from "./api.js";
import { usePolling } from "./usePolling.js";
import { C } from "./theme.js";

const BYE_SCENARIO = "Bye — no opponent available this round.";

function avatarFor(name) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
}

function PromptmonCard({ data, side }) {
  const isOpponent = side === "opponent";
  const accent = isOpponent ? C.ember : C.arc;
  const Icon = isOpponent ? Shield : Sword;

  return (
    <div
      className="relative flex-1 rounded-2xl p-5 backdrop-blur-xl bg-white/[0.035] border transition-transform duration-300 hover:-translate-y-1"
      style={{ borderColor: `${accent}33`, boxShadow: `0 0 30px -12px ${accent}55` }}
    >
      <div
        className="absolute top-4 right-4 text-[10px] font-bold tracking-widest px-2 py-1 rounded-full uppercase"
        style={{ color: accent, backgroundColor: `${accent}1A`, border: `1px solid ${accent}44` }}
      >
        {isOpponent ? "Opponent" : "You"}
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 mb-3" style={{ borderColor: `${accent}55`, boxShadow: `0 0 20px -4px ${accent}66` }}>
          <img src={avatarFor(data.name)} alt={data.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold" style={{ color: C.textPrimary, fontFamily: "Orbitron" }}>{data.name}</h3>
        <p className="text-xs uppercase tracking-widest mt-1" style={{ color: accent }}>{data.type}</p>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
            <Icon size={12} /> Abilities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.abilities.map((a) => (
              <span key={a} className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10" style={{ color: C.textPrimary }}>{a}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Strengths</div>
          <ul className="space-y-0.5" style={{ color: "#c8cedb" }}>
            {data.strengths.map((s) => <li key={s} className="flex gap-1.5"><span className="text-emerald-400">+</span> {s}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Weaknesses</div>
          <ul className="space-y-0.5" style={{ color: "#c8cedb" }}>
            {data.weaknesses.map((w) => <li key={w} className="flex gap-1.5"><span className="text-rose-400">–</span> {w}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function VersusOrb() {
  return (
    <div className="hidden md:flex items-center justify-center px-2">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping-slow" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FB4570]/40 to-[#2DE2E6]/40 blur-md" />
        <div className="relative w-12 h-12 rounded-full bg-[#0D121F] border border-white/15 flex items-center justify-center font-bold text-xs" style={{ color: C.textPrimary, fontFamily: "Orbitron" }}>VS</div>
      </div>
    </div>
  );
}

function PromptCounter({ used, max }) {
  return (
    <div className="flex flex-col items-center gap-3 my-8">
      <span className="text-xs uppercase tracking-[0.2em]" style={{ color: C.textMuted }}>Prompts Remaining</span>
      <div className="flex items-center gap-3">
        {Array.from({ length: max }).map((_, i) => {
          const isUsed = i < used;
          return (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-500 ${isUsed ? "opacity-20 scale-50" : "animate-pulse-glow"}`}
              style={{ backgroundColor: isUsed ? "#3a3f4d" : C.arc, boxShadow: isUsed ? "none" : `0 0 14px 2px ${C.arc}aa` }}
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>{max - used} / {max}</span>
    </div>
  );
}

function ChatBubble({ role, text }) {
  const isUser = role === "you";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${isUser ? "border-[#2DE2E6]/40 bg-[#2DE2E6]/10" : "border-[#FB4570]/40 bg-[#FB4570]/10"}`}>
          {isUser ? <User size={14} style={{ color: C.arc }} /> : <Bot size={14} style={{ color: C.ember }} />}
        </div>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${
            isUser ? "bg-gradient-to-br from-[#2DE2E6]/20 to-[#2DE2E6]/5 border border-[#2DE2E6]/30 rounded-br-sm" : "bg-white/[0.04] border border-white/10 rounded-bl-sm"
          }`}
          style={{ color: isUser ? C.textPrimary : "#dfe4ef" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[#FB4570]/40 bg-[#FB4570]/10">
          <Bot size={14} style={{ color: C.ember }} />
        </div>
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/10 text-sm flex items-center gap-2" style={{ color: C.textMuted }}>
          <Loader2 size={14} className="animate-spin" /> AI is resolving your move...
        </div>
      </div>
    </div>
  );
}

export default function BattleView({ sessionId, onFinished, onBye, onTournamentEnded }) {
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [awaitingOpponent, setAwaitingOpponent] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getCurrentMatch(sessionId);
        if (cancelled) return;

        if (data.scenario === BYE_SCENARIO) {
          onBye?.();
          return;
        }

        setMatch(data);
        if (data.your_turns_used >= (data.max_turns ?? 3)) setAwaitingOpponent(true);
      } catch (err) {
        if (cancelled) return;
        if (isTournamentFinished(err)) {
          onTournamentEnded?.();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load match");
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, onBye, onTournamentEnded]);
  
 
  const pollStatus = useCallback(async () => {
  if (!match) return;
  try {
    const s = await api.getMatchStatus(sessionId, match.match_id);

    if (s.status === "finished") {
      // Already judged (e.g. opponent's client triggered finish first).
      const result = await api.finishBattle(sessionId, match.match_id);
      const won = result.winner_session_id === sessionId;
      onFinished(result, match.match_id, match.round, won);
      return;
    }

    if (s.your_turns_used >= 3 && s.opponent_turns_used >= 3) {
      // Both sides done, but not yet judged — trigger it now. Idempotent,
      // safe even if the opponent's client fires this in the same window.
      const result = await api.finishBattle(sessionId, match.match_id);
      const won = result.winner_session_id === sessionId;
      onFinished(result, match.match_id, match.round, won);
    }
  } catch (err) {
    if (isTournamentFinished(err)) {
      onTournamentEnded?.();
      return;
    }
    /* opponent not done yet — keep polling */
  }
}, [sessionId, match, onFinished, onTournamentEnded]);

  usePolling(pollStatus, 6000, awaitingOpponent && !!match);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, submitting]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || submitting || !match) return;
    setSubmitting(true);
    setError(null);
    setMessages((m) => [...m, { role: "you", text: trimmed }]);
    setInput("");
    try {
      const result = await api.submitPrompt(sessionId, match.match_id, trimmed);
      setMessages((m) => [...m, { role: "ai", text: result.gemini_response }]);
      const nextUsed = match.your_turns_used + 1;
      setMatch((m) => ({ ...m, your_turns_used: nextUsed }));
      if (nextUsed >= (match.max_turns ?? 3)) setAwaitingOpponent(true);
    } catch (err) {
      if (isTournamentFinished(err)) {
        onTournamentEnded?.();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Submit failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={24} className="animate-spin" style={{ color: C.arc }} />
      </div>
    );
  }

  const maxTurns = match.max_turns ?? 3;
  const promptsExhausted = match.your_turns_used >= maxTurns;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: C.bg }}>
      <style>{`
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 8px 2px ${C.arc}aa; transform: scale(1);} 50% { box-shadow: 0 0 18px 4px ${C.arc}cc; transform: scale(1.08);} }
        .animate-pulse-glow { animation: pulseGlow 1.8s ease-in-out infinite; }
        @keyframes pingSlow { 0% { transform: scale(0.9); opacity:0.6;} 100% { transform: scale(1.6); opacity:0;} }
        .animate-ping-slow { animation: pingSlow 2.4s ease-out infinite; }
        @keyframes bounceDot { 0%,80%,100% { transform: scale(0.6); opacity:0.3;} 40% { transform: scale(1); opacity:1;} }
        .dot { animation: bounceDot 1.4s infinite ease-in-out; }
      `}</style>

      <header className="text-center pt-8 pb-4 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs tracking-[0.2em] font-semibold mb-3" style={{ borderColor: `${C.arc}4d`, backgroundColor: `${C.arc}0d`, color: C.arc }}>
          <Zap size={12} /> LIVE BATTLE
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-wide px-2" style={{ color: C.textPrimary, fontFamily: "Orbitron" }}>
          {match.round === "round3" ? "Round 3" : "Round 2"} — Prompt Battle
        </h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-2 mb-8">
        <div className="rounded-2xl p-[1px]" style={{ background: `linear-gradient(90deg, ${C.gold}80, ${C.gold}1a, ${C.gold}80)` }}>
          <div className="rounded-2xl bg-[#0D121F]/80 backdrop-blur-xl px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-[0.2em] uppercase" style={{ color: C.gold }}>
              <Sparkles size={14} /> Battle Scenario
            </div>
            <p className="text-base sm:text-lg leading-relaxed italic" style={{ color: C.textPrimary }}>"{match.scenario}"</p>
            {match.twist && <p className="mt-2 text-sm" style={{ color: C.ember }}>Twist: {match.twist}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-stretch gap-4 md:gap-2">
        <PromptmonCard data={match.opponent_promptmon} side="opponent" />
        <VersusOrb />
        <PromptmonCard data={match.your_promptmon} side="you" />
      </div>

      <PromptCounter used={match.your_turns_used} max={maxTurns} />

      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Zap size={14} style={{ color: C.arc }} />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: C.textMuted }}>Battle Strategy Channel</span>
          </div>

          <div ref={scrollRef} className="max-h-[280px] sm:max-h-[360px] overflow-y-auto px-4 py-4">
            {messages.map((m, i) => <ChatBubble key={i} role={m.role} text={m.text} />)}
            {submitting && <LoadingBubble />}
          </div>

          <div className="p-4 border-t border-white/10 space-y-3">
            {!promptsExhausted ? (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                  rows={2}
                  placeholder="Send your battle prompt..."
                  className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/10 focus:outline-none focus:ring-2 px-4 py-3 text-sm disabled:opacity-40 transition"
                  style={{ color: C.textPrimary }}
                />
                <button
                  onClick={handleSend}
                  disabled={submitting || !input.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold tracking-wide active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#06131a", background: `linear-gradient(90deg, ${C.arc}, #5df0f3)`, fontFamily: "Orbitron" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? "Submitting..." : "Send Prompt"}
                </button>
              </>
            ) : (
              <p className="text-center text-sm font-medium" style={{ color: C.textMuted }}>You have used all available prompts.</p>
            )}
          </div>
        </div>

        {awaitingOpponent && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="font-semibold" style={{ color: C.textPrimary }}>Waiting for your opponent to finish...</p>
            <div className="flex gap-1.5">
              {[0, 0.2, 0.4].map((d) => (
                <span key={d} className="dot w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.ember, animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm" style={{ color: C.ember }}>{error}</p>}
      </div>
    </div>
  );
}