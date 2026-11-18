import { useEffect, useRef, useState } from 'react';
import type { QuizAnswerRecord } from '../types/quiz';

interface ResultsSummaryProps {
  answers: QuizAnswerRecord[];
  categoryLabel: string;
  difficultyLabel: string;
  customQuizTitle: string | null;
  onPlayAgain: () => void;
  onRetryWrong: () => void;
  onNotify: (message: string) => void;
}

const SCORE_RING_SIZE = 136;
const SCORE_STROKE = 8;
const SCORE_RADIUS = (SCORE_RING_SIZE - SCORE_STROKE) / 2;
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS;

function getTierMessage(percent: number): string {
  if (percent === 100) return 'Perfect!';
  if (percent >= 75) return 'Great job';
  if (percent >= 50) return 'Good effort';
  return 'Keep practising';
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export function ResultsSummary({
  answers,
  categoryLabel,
  difficultyLabel,
  customQuizTitle,
  onPlayAgain,
  onRetryWrong,
  onNotify,
}: ResultsSummaryProps) {
  const totalCount = answers.length;
  const correctCount = answers.filter((a) => a.outcome === 'correct').length;
  const wrongCount = answers.filter((a) => a.outcome === 'wrong').length;
  const timeoutCount = answers.filter((a) => a.outcome === 'timeout').length;
  const retryableCount = wrongCount + timeoutCount;

  const percent =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const [ringAnimated, setRingAnimated] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setRingAnimated(true);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [percent]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const targetOffset = SCORE_CIRCUMFERENCE * (1 - percent / 100);
  const strokeDashoffset = ringAnimated ? targetOffset : SCORE_CIRCUMFERENCE;
  const tierMessage = getTierMessage(percent);

  const handleShare = async () => {
    const meta = customQuizTitle
      ? `Quiz: ${customQuizTitle}`
      : `Category: ${categoryLabel} | Difficulty: ${difficultyLabel}`;
    const summary = `I scored ${correctCount}/${totalCount} (${percent}%) on Gift's Quiz! ${meta}`;

    const ok = await copyTextWithFallback(summary);
    if (ok) {
      setCopied(true);
      onNotify('Result copied to clipboard!');
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } else {
      onNotify('Could not copy automatically.');
    }
  };

  return (
    <div className="results-summary">
      <div className="score-ring-wrap">
        <svg
          className="score-ring"
          width={SCORE_RING_SIZE}
          height={SCORE_RING_SIZE}
          viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}
          aria-hidden="true"
        >
          <circle
            className="score-ring__track"
            cx={SCORE_RING_SIZE / 2}
            cy={SCORE_RING_SIZE / 2}
            r={SCORE_RADIUS}
            strokeWidth={SCORE_STROKE}
            fill="none"
          />
          <circle
            className="score-ring__fill"
            cx={SCORE_RING_SIZE / 2}
            cy={SCORE_RING_SIZE / 2}
            r={SCORE_RADIUS}
            strokeWidth={SCORE_STROKE}
            fill="none"
            strokeDasharray={SCORE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="score-ring__center">
          <span className="score-ring__percent tabular-nums">{percent}%</span>
        </div>
      </div>

      <h1 className="card-heading results-tier">{tierMessage}</h1>
      <p className="results-fraction tabular-nums">
        {correctCount} / {totalCount}
      </p>

      <div className="stats-row" aria-label="Score breakdown">
        <div className="stat-item stat-item--correct">
          <i className="fa-solid fa-check" aria-hidden="true" />
          <span className="tabular-nums">{correctCount} Correct</span>
        </div>
        <div className="stat-item stat-item--wrong">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
          <span className="tabular-nums">{wrongCount} Wrong</span>
        </div>
        <div className="stat-item stat-item--timeout">
          <i className="fa-solid fa-clock" aria-hidden="true" />
          <span className="tabular-nums">{timeoutCount} Timed out</span>
        </div>
      </div>

      <div className="results-actions">
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn-primary"
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
          <span>Play again</span>
        </button>

        {retryableCount > 0 && (
          <button
            type="button"
            onClick={onRetryWrong}
            className="btn-secondary"
          >
            <i className="fa-solid fa-repeat" aria-hidden="true" />
            <span>Retry wrong questions ({retryableCount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="btn-secondary"
        >
          <i
            className={copied ? 'fa-solid fa-check' : 'fa-solid fa-share-nodes'}
            aria-hidden="true"
          />
          <span>{copied ? 'Copied!' : 'Share result'}</span>
        </button>
      </div>
    </div>
  );
}
