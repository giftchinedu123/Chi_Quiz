import { useEffect, useState } from 'react';
import { RATE_LIMIT_COOLDOWN_SECONDS } from '../utils/constants';

export function ErrorMessage({ error, onRetry, onBack }) {
  const initialCooldown =
    error.code === 'RATE_LIMIT'
      ? error.retryAfterSeconds ?? RATE_LIMIT_COOLDOWN_SECONDS
      : 0;

  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    setCooldown(initialCooldown);
  }, [error, initialCooldown]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const intervalId = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldown]);

  const isCoolingDown = cooldown > 0;

  return (
    <div className="error-state" role="alert">
      <div className="error-icon-wrap" aria-hidden="true">
        <i
          className={
            error.code === 'RATE_LIMIT'
              ? 'fa-solid fa-hourglass-half'
              : 'fa-solid fa-triangle-exclamation'
          }
        />
      </div>
      <h2 className="section-subheading">Unable to start quiz</h2>
      <p className="error-copy">{error.message}</p>

      <div className="error-actions">
        <button
          type="button"
          onClick={onRetry}
          disabled={isCoolingDown}
          className="btn-primary"
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
          <span>
            {isCoolingDown ? `Try again (${cooldown}s)` : 'Try again'}
          </span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
