import { AnswerOption } from './AnswerOption.jsx';

function formatDifficulty(diff) {
  if (!diff) return '';
  return diff.charAt(0).toUpperCase() + diff.slice(1);
}

export function QuestionCard({
  question,
  showFeedback,
  answerRecord,
  onSelectOption,
}) {
  return (
    <div className="question-card">
      <div className="question-tags">
        <span className="micro-pill">{question.category}</span>
        {question.difficulty && (
          <span className="micro-pill">
            {formatDifficulty(question.difficulty)}
          </span>
        )}
      </div>

      <h2 className="question-title">{question.question}</h2>

      <div
        className="options-list"
        role="radiogroup"
        aria-label="Answer options"
      >
        {question.options.map((option, index) => {
          const isSelected = answerRecord?.selectedOption === option;
          const isCorrect = option === question.correct;

          return (
            <AnswerOption
              key={`${question.id}-opt-${index}`}
              index={index}
              label={option}
              isSelected={isSelected}
              isCorrect={isCorrect}
              showFeedback={showFeedback}
              locked={showFeedback}
              onSelect={onSelectOption}
            />
          );
        })}
      </div>
    </div>
  );
}
