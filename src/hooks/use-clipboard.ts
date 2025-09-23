import { useCallback, useMemo, useState } from "react";

interface UseClipboardResult {
  copy: (text: string) => Promise<boolean>;
  isSupported: boolean;
  error: Error | null;
}

function isClipboardApiAvailable() {
  if (typeof window === "undefined") {
    return false;
  }

  const { navigator } = window;
  return (
    typeof navigator.clipboard !== "undefined" &&
    typeof navigator.clipboard.writeText === "function"
  );
}

const UNSUPPORTED_ERROR_MESSAGE =
  "Clipboard API unavailable in this environment";

export function useClipboard(): UseClipboardResult {
  const [error, setError] = useState<Error | null>(null);

  const isSupported = useMemo(() => isClipboardApiAvailable(), []);

  const copy = useCallback(async (text: string) => {
    if (text.length === 0) {
      return false;
    }

    if (!isClipboardApiAvailable()) {
      const unsupportedError = new Error(UNSUPPORTED_ERROR_MESSAGE);
      setError(unsupportedError);
      console.warn(UNSUPPORTED_ERROR_MESSAGE);
      return false;
    }

    try {
      await window.navigator.clipboard.writeText(text);
      setError(null);
      return true;
    } catch (clipboardError) {
      const normalizedError =
        clipboardError instanceof Error
          ? clipboardError
          : new Error(String(clipboardError));
      setError(normalizedError);
      console.error("Failed to copy to clipboard:", normalizedError);
      return false;
    }
  }, []);

  return { copy, isSupported, error };
}
