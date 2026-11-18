import { useState, type FormEvent } from 'react';
import type { CustomQuiz, CustomQuizQuestionInput } from '../types/quiz';
import { MIN_CUSTOM_QUIZ_QUESTIONS } from '../utils/constants';

interface QuizFormProps {
  onSaveQuiz: (quiz: CustomQuiz) => void;
}

type OptionIndex = 0 | 1 | 2 | 3;

const EMPTY_OPTIONS: [string, string, string, string] = ['', '', '', ''];

export function QuizForm({ onSaveQuiz }: QuizFormProps) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<CustomQuizQuestionInput[]>([]);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>([
    ...EMPTY_OPTIONS,
  ] as [string, string, string, string]);
  const [correctIndex, setCorrectIndex] = useState<OptionIndex | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editorError, setEditorError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetEditor = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(null);
    setEditingId(null);
    setEditorError(null);
  };

  const handleOptionChange = (index: OptionIndex, value: string) => {
    setOptions((prev) => {
      const next = [...prev] as [string, string, string, string];
      next[index] = value;
      return next;
    });
    if (editorError) setEditorError(null);
  };

  const handleAddOrUpdateQuestion = (e: FormEvent) => {
    e.preventDefault();

    const trimmedQuestion = questionText.trim();
    const trimmedOptions = options.map((opt) => opt.trim()) as [
      string,
      string,
      string,
      string,
    ];

    if (!trimmedQuestion) {
      setEditorError('Please enter the question text.');
      return;
    }

    if (trimmedOptions.some((opt) => opt.length === 0)) {
      setEditorError('Please fill in all four answer options.');
      return;
    }

    const uniqueNormalized = new Set(
      trimmedOptions.map((opt) => opt.toLowerCase())
    );
    if (uniqueNormalized.size < 4) {
      setEditorError('All four answer options must be distinct.');
      return;
    }

    if (correctIndex === null) {
      setEditorError('Please mark which option is the correct answer.');
      return;
    }

    if (editingId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingId
            ? {
                ...q,
                question: trimmedQuestion,
                options: trimmedOptions,
                correctIndex,
              }
            : q
        )
      );
    } else {
      const newQuestion: CustomQuizQuestionInput = {
        id: `custom-q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        question: trimmedQuestion,
        options: trimmedOptions,
        correctIndex,
      };
      setQuestions((prev) => [...prev, newQuestion]);
    }

    setSaveError(null);
    resetEditor();
  };

  const handleEditQuestion = (item: CustomQuizQuestionInput) => {
    setEditingId(item.id);
    setQuestionText(item.question);
    setOptions([...item.options] as [string, string, string, string]);
    setCorrectIndex(item.correctIndex);
    setEditorError(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) {
      resetEditor();
    }
  };

  const handleSaveQuiz = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setSaveError('Please give your quiz a title before saving.');
      return;
    }
    if (questions.length < MIN_CUSTOM_QUIZ_QUESTIONS) {
      setSaveError(
        `Add at least ${MIN_CUSTOM_QUIZ_QUESTIONS} questions before saving your quiz.`
      );
      return;
    }

    const newQuiz: CustomQuiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmedTitle,
      createdAt: Date.now(),
      questions,
    };

    onSaveQuiz(newQuiz);
    setTitle('');
    setQuestions([]);
    setSaveError(null);
    resetEditor();
  };

  return (
    <div className="builder-form-wrap">
      <div className="form-group">
        <label htmlFor="quiz-title-input" className="field-label">
          Quiz title
        </label>
        <input
          id="quiz-title-input"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (saveError) setSaveError(null);
          }}
          placeholder="e.g. Biology Midterm Review"
          className="text-input"
          maxLength={80}
        />
      </div>

      <hr className="divider" />

      <form onSubmit={handleAddOrUpdateQuestion} className="question-editor" noValidate>
        <div className="editor-header">
          <h2 className="section-subheading">
            {editingId ? 'Edit question' : 'Add a question'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetEditor}
              className="text-link-btn"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="question-text-input" className="field-label">
            Question text
          </label>
          <textarea
            id="question-text-input"
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              if (editorError) setEditorError(null);
            }}
            placeholder="Write your question here..."
            className="text-input text-area"
            rows={2}
            maxLength={240}
          />
        </div>

        <div className="form-group">
          <span className="field-label" id="options-editor-label">
            Answer options (select the correct answer)
          </span>
          <div
            className="builder-options-grid"
            role="radiogroup"
            aria-labelledby="options-editor-label"
          >
            {([0, 1, 2, 3] as OptionIndex[]).map((idx) => {
              const isCorrect = correctIndex === idx;
              return (
                <div
                  key={idx}
                  className={`builder-option-row ${isCorrect ? 'is-marked-correct' : ''}`}
                >
                  <label className="radio-correct-toggle">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={isCorrect}
                      onChange={() => {
                        setCorrectIndex(idx);
                        if (editorError) setEditorError(null);
                      }}
                      aria-label={`Mark option ${idx + 1} as correct`}
                    />
                    <span className="radio-visual" aria-hidden="true">
                      <i className="fa-solid fa-check" />
                    </span>
                  </label>

                  <input
                    type="text"
                    value={options[idx]}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    aria-label={`Option ${idx + 1}`}
                    className="text-input builder-option-input"
                    maxLength={120}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {editorError && (
          <p className="inline-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            <span>{editorError}</span>
          </p>
        )}

        <div className="editor-actions">
          <button type="submit" className="btn-secondary">
            <i
              className={editingId ? 'fa-solid fa-check' : 'fa-solid fa-plus'}
              aria-hidden="true"
            />
            <span>{editingId ? 'Save question' : 'Add question'}</span>
          </button>
        </div>
      </form>

      <hr className="divider" />

      <div className="added-questions-section">
        <div className="review-header">
          <h2 className="section-subheading">Questions in this quiz</h2>
          <span className="muted-caption tabular-nums">
            {questions.length} / {MIN_CUSTOM_QUIZ_QUESTIONS} minimum
          </span>
        </div>

        {questions.length === 0 ? (
          <p className="empty-hint">
            No questions added yet. Add at least {MIN_CUSTOM_QUIZ_QUESTIONS} questions to save your quiz.
          </p>
        ) : (
          <ul className="builder-question-list">
            {questions.map((item, idx) => (
              <li key={item.id} className="builder-question-item">
                <div className="builder-question-item__head">
                  <span className="answer-row__index tabular-nums" aria-hidden="true">
                    {idx + 1}
                  </span>
                  <p className="builder-question-item__title">{item.question}</p>
                  <div className="builder-question-item__actions">
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(item)}
                      className="icon-btn"
                      aria-label={`Edit question ${idx + 1}`}
                    >
                      <i className="fa-solid fa-pen" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(item.id)}
                      className="icon-btn icon-btn--danger"
                      aria-label={`Delete question ${idx + 1}`}
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="builder-question-item__correct">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                  <span>Correct: {item.options[item.correctIndex]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {saveError && (
          <p className="inline-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            <span>{saveError}</span>
          </p>
        )}

        <div className="save-quiz-row">
          <button
            type="button"
            onClick={handleSaveQuiz}
            className="btn-primary btn-full"
          >
            <i className="fa-solid fa-bookmark" aria-hidden="true" />
            <span>Save quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
}
