import { useState } from "react";
import { Swords } from "lucide-react";
import { api, ApiError } from "./api.js";
import { C } from "./theme.js";
import { Panel, GlowButton, FieldInput, ErrorText, ScreenTitle } from "./ui.jsx";

export default function UserRegister({ onRegistered, onBack }) {
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await api.registerSession(teamName.trim());
      onRegistered(session);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <ScreenTitle eyebrow="Enter The Arena" title="Register Your Team" />
        <Panel glow={C.ember} className="flex flex-col gap-4">
          <Swords size={28} style={{ color: C.ember, margin: "0 auto" }} />
          <FieldInput
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            required
            autoFocus
          />
          <ErrorText>{error}</ErrorText>
          <GlowButton type="submit" variant="ember" disabled={loading || !teamName.trim()}>
            {loading ? "Registering..." : "Register"}
          </GlowButton>
          <GlowButton type="button" variant="ghost" onClick={onBack}>Back</GlowButton>
        </Panel>
      </form>
    </div>
  );
}