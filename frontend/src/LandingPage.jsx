import { Shield, Swords } from "lucide-react";
import { C, APP_TAGLINE, APP_CREDIT } from "./theme.js";

export default function LandingPage({ go }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: C.bg }}>
      <div className="mb-3 text-xs tracking-[0.3em] uppercase" style={{ color: C.arc }}>
        Season Zero &middot; College AI Club
      </div>

      <h1 className="text-4xl sm:text-7xl font-bold mb-1 tracking-tight leading-none" style={{ color: C.textPrimary, fontFamily: "Orbitron" }}>
        PROMPT<span style={{ color: C.ember }}>MON</span>
      </h1>

      <p className="text-sm sm:text-base tracking-[0.25em] uppercase mb-4" style={{ color: C.arc }}>
        {APP_TAGLINE}
      </p>

      <p className="text-base sm:text-lg mb-1 max-w-md" style={{ color: C.textMuted }}>
        Your prompt. Your creature. Your strategy.
      </p>

      <p className="text-xs mb-12" style={{ color: C.textFaint }}>{APP_CREDIT}</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:w-auto">
        <button
          onClick={() => go("adminLogin")}
          className="flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border transition-transform active:scale-[0.98] sm:w-52"
          style={{ background: C.bgPanel, borderColor: C.hairline }}
        >
          <Shield size={26} style={{ color: C.arc }} />
          <span className="font-semibold text-base" style={{ color: C.textPrimary }}>Admin</span>
          <span className="text-xs" style={{ color: C.textFaint }}>Run the arena</span>
        </button>

        <button
          onClick={() => go("userRegister")}
          className="flex flex-col items-center gap-2 px-8 py-6 rounded-2xl transition-transform active:scale-[0.98] sm:w-52"
          style={{ background: `linear-gradient(150deg, ${C.ember}22, ${C.bgPanel})`, border: `1px solid ${C.ember}55` }}
        >
          <Swords size={26} style={{ color: C.ember }} />
          <span className="font-semibold text-base" style={{ color: C.textPrimary }}>User</span>
          <span className="text-xs" style={{ color: C.textFaint }}>Enter the arena</span>
        </button>
      </div>
    </div>
  );
}