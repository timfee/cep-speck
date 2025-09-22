/**
 * Typing animation configuration and utilities
 */
import { useEffect, useRef, useState } from "react";

export const TYPING_CONSTANTS = {
  INITIAL_DELAY: 100,
  CURSOR_DURATION: 0.8,
  ANIMATION_STEPS: 20,
  TERMINAL_TYPING_SPEED: 20,
  TERMINAL_MIN_HEIGHT: 200,
  TERMINAL_MAX_HEIGHT: 600,
} as const;

/**
 * Hook for managing typing animation state
 */
export function useTypingAnimation(
  text: string,
  typingSpeed: number,
  onComplete?: () => void
) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentIndexRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);

    if (!text) return;

    const typeText = () => {
      if (currentIndexRef.current < text.length) {
        setDisplayedText(text.slice(0, currentIndexRef.current + 1));
        currentIndexRef.current++;
        timeoutRef.current = setTimeout(typeText, typingSpeed);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    timeoutRef.current = setTimeout(typeText, TYPING_CONSTANTS.INITIAL_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, typingSpeed, onComplete]);

  return { displayedText, isComplete };
}