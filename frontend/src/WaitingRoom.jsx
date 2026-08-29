import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "./api.js";
import { usePolling } from "./usePolling.js";
import { C } from "./theme.js";
import { Panel, ScreenTitle } from "./ui.jsx";

export default function WaitingRoom({ onStarted }) {
  const [status, setStatus] = useState(null);

  const poll = useCallback(async () => {
    try {
      const data = await api.getWaitingStatus();
      setStatus(data);
      if (data.tournament_status === "running") onStarted();
    } catch {
      /* keep polling silently */
    }
  }, [onStarted]);

  usePolling(poll, 4000);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <ScreenTitle eyebrow="Standby" title="Waiting for Tournament" />
        <Panel glow={C.arc} className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: C.arc }} />
          <p style={{ color: C.textMuted }}>
            {status ? `${status.registered_teams_count} teams registered` : "Connecting..."}
          </p>
        </Panel>
      </div>
    </div>
  );
}