import React, { useState } from "react";
import { Lock, Shield } from "lucide-react";
import { C } from "./theme";
import { TopBar, Panel, Field, TextInput, PrimaryButton } from "./components";

export default function AdminLoginPage({ go }) {
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
      <TopBar onBack={() => go("landing")} />
      <Panel>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl" style={{ background: C.bgInput }}>
            <Lock size={20} style={{ color: C.arc }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: C.textPrimary, fontFamily: "Rajdhani" }}>
              Command Center
            </h2>
            <p className="text-xs" style={{ color: C.textFaint }}>
              Organizer access only
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            go("adminDashboard");
          }}
          className="space-y-5"
        >
          <Field label="Admin Password">
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoFocus />
          </Field>
          <PrimaryButton type="submit" className="w-full" icon={Shield}>
            Enter Command Center
          </PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}