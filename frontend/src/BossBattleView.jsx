import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Flame } from "lucide-react";
import { api, ApiError, isTournamentFinished } from "./api.js";
import { C } from "./theme.js";

export default function BossBattleView({ sessionId, onFinished, onNotQualified, onTournamentEnded }) {
  const [boss, setBoss] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getCurrentBossBattle(sessionId);
        if (!cancelled) setBoss(data);
      } catch (err) {
        if (isTournamentFinished(err)) {
          onTournamentEnded?.();
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          onNotQualified?.();
        } else if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load boss battle");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, onNotQualified, onTournamentEnded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, submitting]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || submitting || !boss) return;
    setSubmitting(true);
    setError(null);
    setMessages((m) => [...m, { role: "you", text: trimmed }]);
    setInput("");
    try {
      const result = await api.submitBossPrompt(sessionId, boss.boss_battle_id, trimmed);
      setMessages((m) => [...m, { role: "ai", text: result.gemini_response }]);
      const nextUsed = boss.your_turns_used + 1;
      setBoss((b) => ({ ...b, your_turns_used: nextUsed }));
      if (nextUsed >= (boss.max_turns ?? 3)) {
        const finalResult = await api.finishBossBattle(sessionId, boss.boss_battle_id);
        onFinished(finalResult);
      }
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
  }, [input, submitting, boss, sessionId, onFinished, onTournamentEnded]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!boss) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <Loader2 size={24} className="animate-spin" style={{ color: C.ember }} />
      </div>
    );
  }

  const maxTurns = boss.max_turns ?? 3;
  const exhausted = boss.your_turns_used >= maxTurns;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: C.bg }}>
      <header className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs tracking-[0.2em] font-semibold mb-3" style={{ borderColor: `${C.ember}4d`, backgroundColor: `${C.ember}0d`, color: C.ember }}>
          <Flame size={12} /> FINAL BATTLE
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: C.textPrimary, fontFamily: "Orbitron" }}>
          vs {boss.legendary_promptmon_name}
        </h1>
        <p className="text-sm mt-2" style={{ color: C.textMuted }}>Your Promptmon: {boss.your_promptmon.name}</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div ref={scrollRef} className="max-h-[320px] overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "you" ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${m.role === "you" ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/10 bg-white/5">
                    {m.role === "you" ? <User size={14} style={{ color: C.arc }} /> : <Bot size={14} style={{ color: C.ember }} />}
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl text-sm bg-white/[0.04] border border-white/10" style={{ color: C.textPrimary }}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {submitting && <p className="text-sm" style={{ color: C.textMuted }}>The Legendary Promptmon stirs...</p>}
          </div>

          <div className="p-4 border-t border-white/10 space-y-3">
            {!exhausted ? (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                  rows={2}
                  placeholder="Your final strategy..."
                  className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm"
                  style={{ color: C.textPrimary }}
                />
                <button
                  onClick={handleSend}
                  disabled={submitting || !input.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold disabled:opacity-40"
                  style={{ color: "#fff", background: `linear-gradient(90deg, ${C.ember}, #ff7a94)`, fontFamily: "Orbitron" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? "Submitting..." : "Send Prompt"}
                </button>
              </>
            ) : (
              <p className="text-center text-sm" style={{ color: C.textMuted }}>Judging your final battle...</p>
            )}
          </div>
        </div>
        {error && <p className="mt-4 text-center text-sm" style={{ color: C.ember }}>{error}</p>}
      </div>
    </div>
  );
}