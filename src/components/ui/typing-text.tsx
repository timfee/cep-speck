"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import { UI_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
  onComplete?: () => void;
  streaming?: boolean;
}

const TYPING_CONSTANTS = {
  INITIAL_DELAY: 100,
  CURSOR_DURATION: 0.8,
  ANIMATION_STEPS: 20,
  TERMINAL_TYPING_SPEED: 20,
  TERMINAL_MIN_HEIGHT: 200,
  TERMINAL_MAX_HEIGHT: 600,
} as const;

const CursorBlink = ({ character }: { character: string }) => (
  <motion.span
    className="inline-block"
    animate={{ opacity: [1, 0] }}
    transition={{
      duration: TYPING_CONSTANTS.CURSOR_DURATION,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {character}
  </motion.span>
);

const TerminalHeader = ({
  title,
  streaming,
}: {
  title: string;
  streaming: boolean;
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />
      </div>
      <span className="text-sm text-gray-300 ml-2">{title}</span>
    </div>
    {streaming && (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{
            opacity: [
              UI_CONSTANTS.ANIMATION_SCALE_SMALL,
              1,
              UI_CONSTANTS.ANIMATION_SCALE_SMALL,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span>Live</span>
      </div>
    )}
  </div>
);

export function TypingText({
  text,
  typingSpeed = UI_CONSTANTS.DISPLAY_DELAY,
  showCursor = true,
  cursorCharacter = "|",
  className,
  onComplete,
  streaming = false,
}: TypingTextProps) {
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

  const finalText = streaming ? text : displayedText;

  return (
    <div className={cn("relative", className)}>
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {finalText}
        {showCursor && !isComplete && !streaming && (
          <CursorBlink character={cursorCharacter} />
        )}
      </pre>
    </div>
  );
}

export interface TerminalDisplayProps {
  content: string;
  title?: string;
  streaming?: boolean;
  className?: string;
}

export function TerminalDisplay({
  content,
  title = "PRD Output",
  streaming = false,
  className,
}: TerminalDisplayProps) {
  return (
    <motion.div
      className={cn(
        "bg-gray-900 rounded-lg overflow-hidden border shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TerminalHeader title={title} streaming={streaming} />
      <div
        className="p-4 overflow-auto"
        style={{
          minHeight: TYPING_CONSTANTS.TERMINAL_MIN_HEIGHT,
          maxHeight: TYPING_CONSTANTS.TERMINAL_MAX_HEIGHT,
        }}
      >
        <div className="text-green-400 text-xs mb-2">
          $ Generating PRD document...
        </div>
        <TypingText
          text={content}
          typingSpeed={TYPING_CONSTANTS.TERMINAL_TYPING_SPEED}
          showCursor={streaming}
          className="text-gray-100"
          streaming={streaming}
        />
      </div>
    </motion.div>
  );
}
