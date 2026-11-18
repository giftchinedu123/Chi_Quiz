export function AnswerOption({
  index,
  label,
  isSelected,
  isCorrect,
  showFeedback,
  locked,
  onSelect,
}) {
  let stateClass = '';
  let rightIcon = 'fa-solid fa-chevron-right';

  if (showFeedback) {
    if (isCorrect) {
      stateClass = 'is-correct';
      rightIcon = 'fa-solid fa-check';
    } else if (isSelected) {
      stateClass = 'is-wrong';
      rightIcon = 'fa-solid fa-xmark';
    } else {
      stateClass = 'is-dimmed';
    }
  } else if (isSelected) {
    stateClass = 'is-selected';
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={locked}
      onClick={() => onSelect(label)}
      className={`answer-row ${stateClass}`}
    >
      <span className="answer-row__index tabular-nums" aria-hidden="true">
        {index + 1}
      </span>
      <span className="answer-row__text">{label}</span>
      <span className="answer-row__icon" aria-hidden="true">
        <i className={rightIcon} />
      </span>
    </button>
  );
}
