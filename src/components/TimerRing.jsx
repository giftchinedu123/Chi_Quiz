const RING_SIZE = 52;
const STROKE_WIDTH = 3.5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerRing({ secondsLeft, progress, isRunning }) {
  const clamped = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = CIRCUMFERENCE * (1 - clamped);
  const isUrgent = isRunning && secondsLeft <= 3 && secondsLeft > 0;

  return (
    <div
      className={`timer-ring ${isUrgent ? 'timer-ring--urgent' : ''}`}
      aria-label={`${secondsLeft} seconds remaining`}
    >
      <svg
        className="timer-ring__svg"
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="timer-ring__track"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <circle
          className="timer-ring__progress"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="timer-ring__value tabular-nums">{secondsLeft}</span>
    </div>
  );
}
