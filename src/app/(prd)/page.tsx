"use client";

import { StructuredPrdWizard } from "@/components/workflow/structured-prd-wizard";

export const dynamic = "force-dynamic";

export default function Page() {
  // Single agentic workflow - no mode switching
  return (
    <div className="p-6">
      <StructuredPrdWizard />
    </div>
  );
}
