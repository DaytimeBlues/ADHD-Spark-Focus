import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseCountdownReturn {
  timeLeft: number;
  isActive: boolean;
  isDone: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * useCountdown
 *
 * A stable countdown timer hook with pause/resume/reset controls.
 * Uses functional state updates to avoid stale closures.
 * Cleans up interval properly on unmount or dependency changes.
 */
export function useCountdown({
  initialTime,
  onComplete,
  autoStart = true,
}: UseCountdownOptions): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isDone, setIsDone] = useState(false);

  // Use ref for callback to avoid re-subscribing when callback changes
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Main timer effect - only depends on isActive, not timeLeft
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setIsActive(false);
          setIsDone(true);
          onCompleteRef.current?.();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const start = useCallback(() => {
    setTimeLeft(initialTime);
    setIsDone(false);
    setIsActive(true);
  }, [initialTime]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeft > 0 && !isDone) {
      setIsActive(true);
    }
  }, [timeLeft, isDone]);

  const reset = useCallback(() => {
    setIsActive(false);
    setIsDone(false);
    setTimeLeft(initialTime);
  }, [initialTime]);

  const progress = 1 - timeLeft / initialTime;

  return {
    timeLeft,
    isActive,
    isDone,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}
