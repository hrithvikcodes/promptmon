import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { C, TYPES } from "./theme";
import { TopBar, Panel, Field, TextInput, TextArea, TypeBadge, StatGauge, PrimaryButton } from "./components";

export default function CreatePromptmonPage({ go, teamName, setPromptmon }) {
  const [form, setForm] = useState({
    name: "",
    type: "Fire",
    abilities: "",
    hp: 60,
    atk: 60,
    def: 50,
    spd: 55,
    special: "",
    strengths: "",
    weaknesses: "",
    backstory: "",
  });

  const total = form.hp + form.atk + form.def + form.spd;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }));
  const typeInfo = TYPES[form.type];

  const handleSubmit = (e) => {
    e.preventDefault();
    setPromptmon({ ...form, name: form.name || "Unnamed Promptmon" });
    go("loading");
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto w-full">
      <TopBar onBack={() => go("userRegister")} right={<TypeBadge type={"Fire"} size="sm" />} />
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
          Forge Your Promptmon
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Registering for <span style={{ color: C.ember }}>{teamName || "your team"}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <Panel className="space-y-5">
            <Field label="Promptmon Name">
              <TextInput value={form.name} onChange={set("name")} placeholder="e.g. Emberfang Cub" />
            </Field>

            <Field label="Type">
              <select
                value={form.type}
                onChange={set("type")}
                className="w-full px-3.5 py-2.5 rounded-lg border outline-none text-sm"
                style={{ background: C.bgInput, borderColor: C.hairline, color: C.textPrimary }}
              >
                {Object.keys(TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Abilities" hint="Comma-separate multiple abilities.">
              <TextInput value={form.abilities} onChange={set("abilities")} placeholder="e.g. Kindle, Ash Guard" />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
                  Stats
                </span>
                <span className="text-xs font-mono" style={{ color: total > 300 ? C.danger : C.textFaint }}>
                  {total} / 300 pts
                </span>
              </div>
              <div className="space-y-3">
                {[
                  ["hp", "HP"],
                  ["atk", "Attack"],
                  ["def", "Defense"],
                  ["spd", "Speed"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: C.textMuted }}>
                      <span>{label}</span>
                      <span style={{ fontFamily: "IBM Plex Mono" }}>{form[key]}</span>
                    </div>
                    <input type="range" min="10" max="100" value={form[key]} onChange={setNum(key)} className="w-full" style={{ accentColor: C.arc }} />
                  </div>
                ))}
              </div>
            </div>

            <Field label="Special Attack">
              <TextInput value={form.special} onChange={set("special")} placeholder="e.g. Solar Lance" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Strengths">
                <TextInput value={form.strengths} onChange={set("strengths")} placeholder="e.g. Nature, Steel" />
              </Field>
              <Field label="Weaknesses">
                <TextInput value={form.weaknesses} onChange={set("weaknesses")} placeholder="e.g. Water, Earth" />
              </Field>
            </div>

            <Field label="Backstory">
              <TextArea value={form.backstory} onChange={set("backstory")} rows={4} placeholder="Where did this creature come from?" />
            </Field>
          </Panel>

          <PrimaryButton type="submit" className="w-full" icon={Sparkles}>
            Submit Promptmon
          </PrimaryButton>
        </form>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-10">
            <Panel style={{ borderColor: typeInfo.color + "55" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest" style={{ color: C.textFaint, fontFamily: "Rajdhani" }}>
                  Card Preview
                </span>
                <TypeBadge type={form.type} size="sm" />
              </div>

              <div
                className="w-full aspect-square rounded-xl mb-4 flex items-center justify-center border"
                style={{ background: C.bgInput, borderColor: C.hairlineSoft }}
              >
                {React.createElement(typeInfo.icon, { size: 48, style: { color: typeInfo.color, opacity: 0.6 } })}
              </div>

              <h3 className="text-lg font-bold mb-3" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
                {form.name || "Unnamed Promptmon"}
              </h3>

              <div className="space-y-2.5 mb-4">
                <StatGauge label="HP" value={form.hp} color={C.success} />
                <StatGauge label="Attack" value={form.atk} color={C.danger} />
                <StatGauge label="Defense" value={form.def} color={C.arc} />
                <StatGauge label="Speed" value={form.spd} color={C.ember} />
              </div>

              {form.special && (
                <div className="pt-3 border-t" style={{ borderColor: C.hairlineSoft }}>
                  <span className="text-xs uppercase tracking-wider" style={{ color: C.textFaint }}>
                    Special Attack
                  </span>
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                    {form.special}
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}