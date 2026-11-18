export function FeedbackBar({ outcome, isLastQuestion, onNext }) {
  const config =
    outcome === 'correct'
      ? {
          label: 'Correct!',
          icon: 'fa-solid fa-circle-check',
          variant: 'feedback-badge--correct',
        }
      : outcome === 'wrong'
        ? {
            label: 'Wrong',
            icon: 'fa-solid fa-circle-xmark',
            variant: 'feedback-badge--wrong',
          }
        : {
            label: "Time's up",
            icon: 'fa-solid fa-clock',
            variant: 'feedback-badge--timeout',
          };

  return (
    <div className="feedback-bar" aria-live="polite">
      <div className={`feedback-badge ${config.variant}`}>
        <i className={config.icon} aria-hidden="true" />
        <span>{config.label}</span>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="btn-primary btn-sm"
      >
        <span>{isLastQuestion ? 'Finish' : 'Next'}</span>
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  );
}
