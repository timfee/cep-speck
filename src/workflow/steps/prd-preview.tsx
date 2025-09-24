import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface PrdPreviewProps {
  content: string;
  onCopy: () => void | Promise<void>;
}

export function PrdPreview({ content, onCopy }: PrdPreviewProps) {
  if (content.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Generated PRD</h3>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
      </div>
    </Card>
  );
}
