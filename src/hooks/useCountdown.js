import { useEffect, useRef, useState } from 'react';

export function useCountdown({ durationMs, isRunning, resetKey, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    hasExpiredRef.current = false;
    setRemainingMs(durationMs);
  }, [durationMs, resetKey]);

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
  const progress =
    durationMs > 0 ? Math.max(0, Math.min(1, remainingMs / durationMs)) : 0;

  return {
    remainingMs,
    secondsLeft,
    progress,
  };
}
