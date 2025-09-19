"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

export function TypingText({
  text,
  typingSpeed = 30,
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
    // Reset when text changes
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

    // Start typing with a small delay
    timeoutRef.current = setTimeout(typeText, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, typingSpeed, onComplete]);

  // For streaming content, show text immediately without typing effect
  const finalText = streaming ? text : displayedText;

  return (
    <div className={cn("relative", className)}>
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {finalText}
        {showCursor && !isComplete && !streaming && (
          <motion.span
            className="inline-block"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            {cursorCharacter}
          </motion.span>
        )}
      </pre>
    </div>
  );
}

// Enhanced code display with terminal-like appearance
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
      {/* Terminal Header */}
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
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div className="p-4 min-h-[200px] max-h-[600px] overflow-auto">
        <div className="text-green-400 text-xs mb-2">
          $ Generating PRD document...
        </div>
        <TypingText
          text={content}
          typingSpeed={20}
          showCursor={streaming}
          className="text-gray-100"
          streaming={streaming}
        />
      </div>
    </motion.div>
  );
}
