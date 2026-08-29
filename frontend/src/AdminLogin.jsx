import { useState } from "react";
import { Shield } from "lucide-react";
import { api, ApiError } from "./api.js";
import { C } from "./theme.js";
import { Panel, GlowButton, FieldInput, ErrorText, ScreenTitle } from "./ui.jsx";

export default function AdminLogin({ onSuccess, onBack }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.adminLogin(password);
      onSuccess(password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <ScreenTitle eyebrow="Arena Control" title="Admin Login" />
        <Panel glow={C.arc} className="flex flex-col gap-4">
          <Shield size={28} style={{ color: C.arc, margin: "0 auto" }} />
          <FieldInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            autoFocus
          />
          <ErrorText>{error}</ErrorText>
          <GlowButton type="submit" disabled={loading} variant="arc">
            {loading ? "Checking..." : "Login"}
          </GlowButton>
          <GlowButton type="button" variant="ghost" onClick={onBack}>Back</GlowButton>
        </Panel>
      </form>
    </div>
  );
}