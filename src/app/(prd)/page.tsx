"use client";

import { useState } from "react";

import { StructuredPrdWizard } from "@/components/workflow/StructuredPrdWizard";

import { TraditionalMode } from "./components/traditional-mode";

type Mode = "structured" | "traditional";

export default function Page() {
  const [mode, setMode] = useState<Mode>("structured");

  // Show structured wizard or traditional interface
  if (mode === "structured") {
    return (
      <div className="p-6">
        <StructuredPrdWizard onTraditionalMode={() => setMode("traditional")} />
      </div>
    );
  }

  // Traditional mode
  return <TraditionalMode onStructuredMode={() => setMode("structured")} />;
}
