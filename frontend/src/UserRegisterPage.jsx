import React, { useState } from "react";
import { Users, ChevronRight } from "lucide-react";
import { C } from "./theme";
import { TopBar, Panel, Field, TextInput, PrimaryButton } from "./components";

export default function UserRegisterPage({ go, setTeamName, teamName }) {
  const [value, setValue] = useState(teamName || "");
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
      <TopBar onBack={() => go("landing")} />
      <Panel>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl" style={{ background: C.bgInput }}>
            <Users size={20} style={{ color: C.ember }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              Team Registration
            </h2>
            <p className="text-xs" style={{ color: C.textFaint }}>
              One entry per squad
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTeamName(value || "Unnamed Squad");
            go("createPromptmon");
          }}
          className="space-y-5"
        >
          <Field label="Team Name" hint="This is how the arena will know you.">
            <TextInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Ashfall Circuit" autoFocus />
          </Field>
          <PrimaryButton type="submit" className="w-full" icon={ChevronRight}>
            Continue
          </PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}