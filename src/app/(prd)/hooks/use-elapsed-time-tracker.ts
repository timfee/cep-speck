import { useEffect } from "react";

/**
 * Custom hook to track elapsed time during streaming
 */
export function useElapsedTimeTracker(
  streaming: boolean,
  startTime: number,
  setElapsedTime: (time: number) => void
) {
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (streaming && startTime > 0) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [streaming, startTime, setElapsedTime]);
}
