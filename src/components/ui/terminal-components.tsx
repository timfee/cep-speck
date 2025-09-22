/**
 * Terminal display components
 */
import { motion } from "framer-motion";

import { UI_CONSTANTS } from "@/lib/constants";

import { TYPING_CONSTANTS } from "./typing-animation-hooks";

export const TerminalHeader = ({
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

export const CursorBlink = ({ character }: { character: string }) => (
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

export const getTerminalStyles = () => ({
  minHeight: TYPING_CONSTANTS.TERMINAL_MIN_HEIGHT,
  maxHeight: TYPING_CONSTANTS.TERMINAL_MAX_HEIGHT,
});