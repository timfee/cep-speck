import { useEffect, useState } from "react";

import { createAnimationConfig } from "../metrics-dashboard-utils";

export function useAnimatedWordCount(wordCount: number) {
  const [animatedWordCount, setAnimatedWordCount] = useState(0);

  useEffect(() => {
    const config = createAnimationConfig(wordCount);
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      setAnimatedWordCount((previous) => {
        const nextValue = Math.floor(config.wordCountStep * step);
        if (nextValue === previous || nextValue >= wordCount) {
          clearInterval(interval);
        }
        return Math.min(nextValue, wordCount);
      });
    }, config.intervalDelay);

    return () => clearInterval(interval);
  }, [wordCount]);

  return animatedWordCount;
}
