"use client";

import { motion } from "framer-motion";

import { UI_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  CursorBlink,
  TerminalHeader,
  getTerminalStyles,
} from "./terminal-components";

import { TYPING_CONSTANTS, useTypingAnimation } from "./typing-animation-hooks";

export interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
  onComplete?: () => void;
  streaming?: boolean;
}

export function TypingText({
  text,
  typingSpeed = UI_CONSTANTS.DISPLAY_DELAY,
  showCursor = true,
  cursorCharacter = "|",
  className,
  onComplete,
  streaming = false,
}: TypingTextProps) {
  const { displayedText, isComplete } = useTypingAnimation(
    text,
    typingSpeed,
    onComplete
  );
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
      <div className="p-4 overflow-auto" style={getTerminalStyles()}>
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
