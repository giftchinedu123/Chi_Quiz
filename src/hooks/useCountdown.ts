import { useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  durationMs: number;
  isRunning: boolean;
  resetKey: string | number;
  onExpire: () => void;
}

interface UseCountdownResult {
  remainingMs: number;
  secondsLeft: number;
  progress: number;
}

export function useCountdown({
  durationMs,
  isRunning,
  resetKey,
  onExpire,
}: UseCountdownOptions): UseCountdownResult {
  const [remainingMs, setRemainingMs] = useState<number>(durationMs);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  // Keep latest onExpire callback without restarting the timer effect
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Reset countdown state whenever the question / resetKey changes
  useEffect(() => {
    hasExpiredRef.current = false;
    setRemainingMs(durationMs);
  }, [durationMs, resetKey]);

  // Timestamp-based deadline interval with clean teardown
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const deadline = Date.now() + durationMs;
    hasExpiredRef.current = false;

    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      setRemainingMs(left);

      if (left <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [durationMs, isRunning, resetKey]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progress = durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;

  return {
    remainingMs,
    secondsLeft,
    progress,
  };
}
