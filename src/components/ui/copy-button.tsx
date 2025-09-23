"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { TIMEOUTS } from "@/lib/constants";

interface CopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({ text, className, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { copy, isSupported } = useClipboard();

  const handleCopy = useCallback(async () => {
    const copiedSuccessfully = await copy(text);
    if (!copiedSuccessfully) {
      return;
    }

    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), TIMEOUTS.SHORT_DELAY);
  }, [copy, onCopy, text]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
      disabled={!isSupported}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </>
      )}
    </Button>
  );
}
