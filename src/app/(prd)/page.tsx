'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Issue } from "@/lib/spec/types";

type Frame =
  | { type: 'phase'; phase: string; attempt: number }
  | { type: 'tokens'; delta: string }
  | { type: 'draft'; draft: string }
  | { type: 'validation'; report: { ok: boolean; issues: Issue[] } }
  | { type: 'result'; draft: string }
  | { type: 'error'; message: string };

export default function Page() {
  const [spec, setSpec] = useState<string>('Project: Example\nTarget SKU: premium\n\n');
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [draft, setDraft] = useState<string>('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const textRef = useRef<string>('');

  const run = useCallback(async () => {
    setStreaming(true);
    setDraft('');
    textRef.current = '';
    setIssues([]);
    setPhase('starting');
    setAttempt(1);

    const res = await fetch('/api/run', {
      method: 'POST',
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
      for (const line of chunk.split('\n')) {
        if (!line.trim()) continue;
        let obj: Frame;
        try { obj = JSON.parse(line); } catch { continue; }
        if (obj.type === 'phase') { setPhase(obj.phase); setAttempt(obj.attempt); }
        if (obj.type === 'tokens') { textRef.current += obj.delta; setDraft(textRef.current); }
        if (obj.type === 'draft') { textRef.current = obj.draft; setDraft(obj.draft); }
        if (obj.type === 'validation') { setIssues(obj.report.issues ?? []); }
        if (obj.type === 'result') { setDraft(obj.draft); }
        if (obj.type === 'error') { setPhase('error'); setDraft(`Error: ${obj.message}`); setStreaming(false); break; }
      }
    }
    setStreaming(false);
  }, [spec]);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Spec</h2>
        <Textarea value={spec} onChange={(e) => setSpec(e.target.value)} rows={16} />
        <Button onClick={run} disabled={streaming}>Run</Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">phase: {phase || '—'}</Badge>
          <Badge variant="outline">attempt: {attempt || 0}</Badge>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Draft</h2>
        <pre className="whitespace-pre-wrap text-sm">{draft}</pre>
        <Separator />
        <h3 className="text-md font-medium">Issues</h3>
        <div className="space-y-2">
          {issues.length === 0 ? <div className="text-sm text-muted-foreground">None</div> :
            issues.map((it, idx) => (
              <div key={idx} className="text-sm">
                <Badge className="mr-2">{it.itemId}</Badge>
                {it.message}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
