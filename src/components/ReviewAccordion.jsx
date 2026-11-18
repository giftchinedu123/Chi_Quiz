import { useState } from 'react';

export function ReviewAccordion({ answers }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleRow = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="review-section" aria-label="Question review">
      <div className="review-header">
        <h2 className="section-subheading">Review answers</h2>
        <span className="muted-caption tabular-nums">
          {answers.length} {answers.length === 1 ? 'question' : 'questions'}
        </span>
      </div>

      <div className="accordion-list">
        {answers.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `review-panel-${index}`;
          const triggerId = `review-trigger-${index}`;

          const statusMeta =
            item.outcome === 'correct'
              ? {
                  label: 'Correct',
                  icon: 'fa-solid fa-check',
                  className: 'is-correct',
                }
              : item.outcome === 'wrong'
                ? {
                    label: 'Wrong',
                    icon: 'fa-solid fa-xmark',
                    className: 'is-wrong',
                  }
                : {
                    label: "Time's up",
                    icon: 'fa-solid fa-clock',
                    className: 'is-timeout',
                  };

          return (
            <div
              key={`${item.questionId}-${index}`}
              className={`accordion-item ${isOpen ? 'is-open' : ''}`}
            >
              <button
                id={triggerId}
                type="button"
                className="accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleRow(index)}
              >
                <span className="accordion-index tabular-nums" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="accordion-question">{item.question}</span>
                <span className={`accordion-status ${statusMeta.className}`}>
                  <i className={statusMeta.icon} aria-hidden="true" />
                  <span className="accordion-status__text">{statusMeta.label}</span>
                </span>
                <span className="accordion-toggle-icon" aria-hidden="true">
                  <i className={isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-plus'} />
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="accordion-panel-wrap"
                hidden={!isOpen}
              >
                <div className="accordion-panel">
                  <p className="review-full-question">{item.question}</p>

                  <div className="review-answers-grid">
                    <div className="review-detail">
                      <span className="review-detail__label">Your answer</span>
                      <span
                        className={`review-detail__value ${
                          item.outcome === 'correct'
                            ? 'text-correct'
                            : item.outcome === 'wrong'
                              ? 'text-wrong'
                              : 'text-muted'
                        }`}
                      >
                        {item.selectedOption ?? 'No answer, time ran out'}
                      </span>
                    </div>

                    <div className="review-detail">
                      <span className="review-detail__label">Correct answer</span>
                      <span className="review-detail__value text-correct">
                        {item.correctOption}
                      </span>
                    </div>
                  </div>

                  <div className={`review-outcome-tag ${statusMeta.className}`}>
                    <i className={statusMeta.icon} aria-hidden="true" />
                    <span>{statusMeta.label}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
