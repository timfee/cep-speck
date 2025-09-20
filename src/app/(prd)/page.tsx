"use client";

import { useState } from "react";

import { AgenticPrdWizard } from "@/components/workflow/AgenticPrdWizard";

import { TraditionalMode } from "./components/TraditionalMode";

type Mode = "agentic" | "traditional";

export default function Page() {
  const [mode, setMode] = useState<Mode>("agentic");

  // Show agentic wizard or traditional interface
  if (mode === "agentic") {
    return (
      <div className="p-6">
        <AgenticPrdWizard onTraditionalMode={() => setMode("traditional")} />
      </div>
    );
  }

  // Traditional mode (fallback to old system)
  return <TraditionalMode onStructuredMode={() => setMode("agentic")} />;
}
