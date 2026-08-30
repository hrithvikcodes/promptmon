import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { C } from "./theme";

export default function LoadingPage({ go }) {
  useEffect(() => {
    const t = setTimeout(() => go("waitingLobby"), 2400);
    return () => clearTimeout(t);
  }, [go]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: C.hairline, borderTopColor: C.ember }}
        />
        <div
          className="absolute inset-3 rounded-full border-4 border-b-transparent animate-spin"
          style={{ borderColor: C.hairline, borderBottomColor: C.arc, animationDirection: "reverse", animationDuration: "1.4s" }}
        />
        <Sparkles size={26} className="absolute inset-0 m-auto" style={{ color: C.ember }} />
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
        Forging your Promptmon&hellip;
      </h2>
      <p className="text-sm" style={{ color: C.textMuted }}>
        Compiling stats, rendering artwork, scoring creativity
      </p>
    </div>
  );
}