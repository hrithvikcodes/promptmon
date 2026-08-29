import { useState } from "react";
import { api, ApiError } from "./api.js";
import { C } from "./theme.js";
import { Panel, GlowButton, FieldInput, FieldTextArea, ErrorText, ScreenTitle } from "./ui.jsx";

const csvToArray = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function PromptmonForm({ sessionId, onCreated }) {
  const [form, setForm] = useState({
    name: "", type: "", abilities: "", special_attack: "",
    strengths: "", weaknesses: "", backstory: "",
    hp: 50, attack: 50, defense: 50, speed: 50,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        abilities: csvToArray(form.abilities),
        stats: {
          hp: Number(form.hp), attack: Number(form.attack),
          defense: Number(form.defense), speed: Number(form.speed),
        },
        special_attack: form.special_attack,
        strengths: csvToArray(form.strengths),
        weaknesses: csvToArray(form.weaknesses),
        backstory: form.backstory,
      };
      const promptmon = await api.createPromptmon(sessionId, payload);
      onCreated(promptmon);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: C.bg }}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <ScreenTitle eyebrow="Design Your Fighter" title="Create Your Promptmon" />
        <Panel glow={C.arc} className="flex flex-col gap-3">
          <FieldInput placeholder="Name" value={form.name} onChange={setField("name")} required />
          <FieldInput placeholder="Type (e.g. Fire / Striker)" value={form.type} onChange={setField("type")} required />
          <FieldInput placeholder="Abilities (comma separated)" value={form.abilities} onChange={setField("abilities")} required />
          <FieldInput placeholder="Special attack" value={form.special_attack} onChange={setField("special_attack")} required />
          <FieldInput placeholder="Strengths (comma separated)" value={form.strengths} onChange={setField("strengths")} required />
          <FieldInput placeholder="Weaknesses (comma separated)" value={form.weaknesses} onChange={setField("weaknesses")} required />
          <FieldTextArea placeholder="Backstory" rows={3} value={form.backstory} onChange={setField("backstory")} required />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["hp", "attack", "defense", "speed"].map((stat) => (
              <label key={stat} className="flex flex-col gap-1 text-xs uppercase" style={{ color: C.textFaint }}>
                {stat}
                <FieldInput type="number" value={form[stat]} onChange={setField(stat)} />
              </label>
            ))}
          </div>

          <ErrorText>{error}</ErrorText>
          <GlowButton type="submit" variant="arc" disabled={loading}>
            {loading ? "Creating..." : "Create Promptmon"}
          </GlowButton>
        </Panel>
      </form>
    </div>
  );
}