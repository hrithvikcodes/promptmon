import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { C, TYPES } from "./theme";

export function ArenaBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden" style={{ background: C.bgDeep }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,102,180,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,102,180,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 560,
          height: 560,
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(255,178,56,0.20) 0%, rgba(69,232,209,0.10) 45%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}

export function TopBar({ onBack, backLabel = "Back", right }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-8">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors shrink-0" style={{ color: C.textMuted }}>
          <ArrowLeft size={16} />
          {backLabel}
        </button>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={18} style={{ color: C.ember }} className="shrink-0" />
          <span className="text-xs sm:text-sm tracking-widest uppercase truncate" style={{ color: C.textFaint, fontFamily: "Rajdhani" }}>
            PROMPTMON: AI BATTLE ARENA
          </span>
        </div>
      )}
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Panel({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${className}`} style={{ background: C.bgPanel, borderColor: C.hairline, ...style }}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, icon: Icon, className = "", type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: disabled ? C.emberDim : `linear-gradient(135deg, ${C.ember}, #FF8A3D)`,
        color: "#241407",
        fontFamily: "Rajdhani",
        letterSpacing: "0.02em",
      }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon: Icon, className = "", tone = "arc" }) {
  const col = tone === "danger" ? C.danger : C.arc;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base border transition-colors active:scale-[0.98] ${className}`}
      style={{ background: "transparent", borderColor: col, color: col, fontFamily: "Rajdhani", letterSpacing: "0.02em" }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

expo