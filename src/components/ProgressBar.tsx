interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(1, total);
  const percent = Math.min(100, Math.max(0, (current / safeTotal) * 100));

  return (
    <div className="progress-wrapper">
      <div className="progress-meta">
        <span className="progress-label tabular-nums">
          Question {current} of {safeTotal}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={safeTotal}
      >
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
