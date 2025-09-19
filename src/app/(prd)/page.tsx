"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CodeEditor } from "@/components/ui/code-editor";
import { Status } from "@/components/ui/status";
import { useSpecValidation } from "@/hooks/useSpecValidation";
import type { Issue, StreamFrame } from "@/lib/spec/types";
import { useCallback, useRef, useState } from "react";

export default function Page() {
  const [spec, setSpec] = useState<string>(
    "Project: Example\nTarget SKU: premium\n\n"
  );
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [attempt, setAttempt] = useState<number>(0);
  const [draft, setDraft] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const textRef = useRef<string>("");

  // Real-time spec validation
  const validation = useSpecValidation(spec);

  const run = useCallback(async () => {
    setStreaming(true);
    setDraft("");
    textRef.current = "";
    setIssues([]);
    setPhase("starting");
    setAttempt(1);

    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify({ specText: spec }),
    });

    if (!res.body) {
      setStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        let obj: StreamFrame;
        try {
          obj = JSON.parse(line);
        } catch {
          continue;
        }
        if (obj.type === "phase") {
          setPhase(obj.data.phase);
          setAttempt(obj.data.attempt);
        }
        if (obj.type === "generation") {
          textRef.current += obj.data.delta;
          setDraft(textRef.current);
        }
        if (obj.type === "validation") {
          setIssues(obj.data.report.issues ?? []);
        }
        if (obj.type === "result") {
          setDraft(obj.data.finalDraft);
        }
        if (obj.type === "error") {
          setPhase("error");
          setDraft(`Error: ${obj.data.message}`);
          setStreaming(false);
          break;
        }
      }
    }
    setStreaming(false);
  }, [spec]);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Spec</h2>
        
        {/* Real-time validation status */}
        <div className="flex flex-wrap items-center gap-2">
          <Status
            status={validation.issues.length === 0 ? "valid" : "invalid"}
            message={
              validation.issues.length === 0
                ? `Spec valid (${validation.completionScore}% complete)`
                : `${validation.issues.length} issue${validation.issues.length === 1 ? "" : "s"}`
            }
          />
          <Badge variant="outline" className="text-xs">
            {validation.estimatedWordCount} words
          </Badge>
        </div>

        {/* Enhanced code editor */}
        <CodeEditor
          value={spec}
          onChange={setSpec}
          title="PRD Specification Input"
          placeholder="Project: Example&#10;Target SKU: premium&#10;&#10;Objective: Brief description of what you want to build&#10;Target Users: Who will use this feature&#10;&#10;Enter your PRD specification here..."
          copyButton={true}
          showWordCount={true}
          maxWords={200}
          rows={14}
        />

        {/* Real-time validation feedback */}
        {validation.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Input Suggestions:</h4>
            <div className="space-y-1">
              {validation.issues.map((issue, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested sections */}
        {validation.suggestedSections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Suggested additions:</h4>
            <div className="space-y-1">
              {validation.suggestedSections.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                  onClick={() => {
                    const newSpec = spec.trim() + '\n' + suggestion;
                    setSpec(newSpec);
                  }}
                >
                  + {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={run} disabled={streaming || validation.issues.length > 2}>
          Run
        </Button>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              phase === "generating"
                ? "default"
                : phase === "validating"
                ? "secondary"
                : phase === "healing"
                ? "outline"
                : phase === "done"
                ? "default"
                : phase === "error"
                ? "destructive"
                : "secondary"
            }
            className="text-base px-4 py-2 font-medium"
          >
            {phase === "generating" && "🔄 Generating"}
            {phase === "validating" && "🔍 Validating"}
            {phase === "healing" && "🩹 Healing"}
            {phase === "done" && "✅ Complete"}
            {phase === "error" && "❌ Error"}
            {!phase && "⏸️ Ready"}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Attempt: {attempt || 0}
          </Badge>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Draft</h2>
        <pre className="whitespace-pre-wrap text-sm">{draft}</pre>
        <Separator />
        <h3 className="text-md font-medium">Issues</h3>
        <div className="space-y-2">
          {issues.length === 0 ? (
            <div className="text-sm text-muted-foreground">None</div>
          ) : (
            issues.map((it, idx) => (
              <div key={idx} className="text-sm">
                <Badge className="mr-2">{it.itemId}</Badge>
                {it.message}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
