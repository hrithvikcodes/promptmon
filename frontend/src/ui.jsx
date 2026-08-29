import { C } from "./theme.js";

export function Panel({ children, glow = C.arc, className = "" }) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl bg-white/[0.03] border p-4 sm:p-6 ${className}`}
      style={{ borderColor: `${glow}33`, boxShadow: `0 0 40px -18px ${glow}55` }}
    >
      {children}
    </div>
  );
}

export function GlowButton({ children, onClick, disabled, type = "button", variant = "arc", className = "" }) {
  const color = variant === "ember" ? C.ember : variant === "gold" ? C.gold : C.arc;
  const isGhost = variant === "ghost";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl font-bold tracking-wide transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={
        isGhost
          ? { color: C.textMuted, background: "transparent", border: `1px solid ${C.hairline}` }
          : { color: "#06131a", background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 25px -6px ${color}aa` }
      }
    >
      {children}
    </button>
  );
}

export function FieldInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#2DE2E6]/50 focus:outline-none focus:ring-2 focus:ring-[#2DE2E6]/20 px-4 py-3 text-sm text-[#E6EAF2] placeholder:text-[#5c6478] transition"
    />
  );
}

export function FieldTextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#2DE2E6]/50 focus:outline-none focus:ring-2 focus:ring-[#2DE2E6]/20 px-4 py-3 text-sm text-[#E6EAF2] placeholder:text-[#5c6478] transition"
    />
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="text-sm" style={{ color: C.ember }}>{children}</p>;
}

export function ScreenTitle({ eyebrow, title }) {
  return (
    <div className="text-center mb-6">
      {eyebrow && (
        <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: C.arc }}>
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl font-bold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
        {title}
      </h2>
    </div>
  );
}