import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CategoryPicker } from '../components/CategoryPicker';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { ErrorMessage } from '../components/ErrorMessage';
import { FeedbackBar } from '../components/FeedbackBar';
import { Loader } from '../components/Loader';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionCard } from '../components/QuestionCard';
import { ResultsSummary } from '../components/ResultsSummary';
import { ReviewAccordion } from '../components/ReviewAccordion';
import { TimerRing } from '../components/TimerRing';
import { Toast } from '../components/Toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useQuiz } from '../hooks/useQuiz';
import type { CustomQuiz } from '../types/quiz';
import {
  CATEGORIES,
  CUSTOM_QUIZZES_STORAGE_KEY,
  DIFFICULTIES,
} from '../utils/constants';

interface QuizLocationState {
  customQuizId?: string;
}

export function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    state,
    currentQuestion,
    currentAnswer,
    isLastQuestion,
    countdown,
    selectCategory,
    selectDifficulty,
    startQuiz,
    startCustomQuiz,
    submitAnswer,
    advanceNow,
    retryWrong,
    resetQuiz,
  } = useQuiz();

  const [customQuizzes, setCustomQuizzes] = useLocalStorage<CustomQuiz[]>(
    CUSTOM_QUIZZES_STORAGE_KEY,
    []
  );

  const [confirmingQuit, setConfirmingQuit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const handledRouteQuizRef = useRef(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Support launching a saved custom quiz directly from /builder
  useEffect(() => {
    if (handledRouteQuizRef.current) return;
    const routeState = location.state as QuizLocationState | null;
    const targetId = routeState?.customQuizId;
    if (!targetId) return;

    handledRouteQuizRef.current = true;
    const match = customQuizzes.find((q) => q.id === targetId);
    if (match) {
      startCustomQuiz(match);
    }
    navigate('/quiz', { replace: true, state: null });
  }, [customQuizzes, location.state, navigate, startCustomQuiz]);

  // Clear inline quit confirmation whenever question or status changes
  useEffect(() => {
    setConfirmingQuit(false);
  }, [state.status, state.currentIndex]);

  const handleDeleteCustomQuiz = (id: string) => {
    setCustomQuizzes((prev) => prev.filter((q) => q.id !== id));
    showToast('Quiz deleted');
  };

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === state.categoryId)?.label ?? 'Any Category';
  const selectedDifficultyLabel =
    DIFFICULTIES.find((d) => d.value === state.difficulty)?.label ?? 'Any';

  const isLoading = state.status === 'loading';
  const isPlaying = state.status === 'question' || state.status === 'feedback';

  return (
    <main className="page-shell">
      <section className="quiz-card" aria-label="Quiz workspace">
        {state.status === 'setup' && (
          <div className="screen-enter">
            <div className="card-top-nav">
              <Link to="/" className="back-link">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                <span>Home</span>
              </Link>
              <Link to="/builder" className="secondary-link">
                <i className="fa-solid fa-sliders" aria-hidden="true" />
                <span>Create your own quiz</span>
              </Link>
            </div>

            <div className="card-header">
              <span className="pill-label">
                <span className="pill-dot" aria-hidden="true" />
                <span>Quiz</span>
              </span>
              <h1 className="card-heading">Set up your quiz</h1>
              <p className="card-subtitle">
                Pick a category and difficulty, then race the 10-second clock.
              </p>
            </div>

            <div className="setup-body">
              <CategoryPicker
                selectedId={state.categoryId}
                onSelect={selectCategory}
                disabled={isLoading}
              />

              <DifficultyPicker
                selected={state.difficulty}
                onSelect={selectDifficulty}
                disabled={isLoading}
              />

              <div className="setup-actions">
                <button
                  type="button"
                  onClick={startQuiz}
                  disabled={isLoading}
                  className="btn-primary btn-full"
                >
                  <span>Start quiz</span>
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>

                <Link to="/builder" className="secondary-text-link">
                  Create your own quiz
                </Link>
              </div>
            </div>

            {customQuizzes.length > 0 && (
              <section className="my-quizzes" aria-label="My quizzes">
                <hr className="divider" />
                <div className="review-header">
                  <h2 className="section-subheading">My quizzes</h2>
                  <span className="muted-caption tabular-nums">
                    {customQuizzes.length} saved
                  </span>
                </div>

                <ul className="saved-quiz-list">
                  {customQuizzes.map((quiz) => (
                    <li key={quiz.id} className="saved-quiz-row">
                      <div className="saved-quiz-row__info">
                        <span className="saved-quiz-row__title">{quiz.title}</span>
                        <span className="saved-quiz-row__meta tabular-nums">
                          {quiz.questions.length} questions
                        </span>
                      </div>
                      <div className="saved-quiz-row__actions">
                        <button
                          type="button"
                          onClick={() => startCustomQuiz(quiz)}
                          className="btn-secondary btn-sm"
                        >
                          <i className="fa-solid fa-play" aria-hidden="true" />
                          <span>Play</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomQuiz(quiz.id)}
                          className="icon-btn icon-btn--danger"
                          aria-label={`Delete ${quiz.title}`}
                        >
                          <i className="fa-solid fa-trash" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {state.status === 'loading' && (
          <div className="screen-enter">
            <Loader />
            <div className="loader-cancel-row">
              <button
                type="button"
                onClick={resetQuiz}
                className="text-link-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {state.status === 'error' && state.error && (
          <div className="screen-enter">
            <ErrorMessage
              error={state.error}
              onRetry={startQuiz}
              onBack={resetQuiz}
            />
          </div>
        )}

        {isPlaying && currentQuestion && (
          <div className="screen-enter">
            <div className="quiz-topbar">
              <ProgressBar
                current={state.currentIndex + 1}
                total={state.questions.length}
              />

              <div className="quiz-topbar__controls">
                <TimerRing
                  secondsLeft={countdown.secondsLeft}
                  progress={countdown.progress}
                  isRunning={state.status === 'question'}
                />

                {!confirmingQuit ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingQuit(true)}
                    className="quit-btn"
                  >
                    Quit
                  </button>
                ) : (
                  <div className="quit-confirm" role="group" aria-label="Confirm quit">
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="quit-confirm__yes"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingQuit(false)}
                      className="quit-confirm__no"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              showFeedback={state.status === 'feedback'}
              answerRecord={currentAnswer}
              onSelectOption={submitAnswer}
            />

            {state.status === 'feedback' && currentAnswer && (
              <FeedbackBar
                outcome={currentAnswer.outcome}
                isLastQuestion={isLastQuestion}
                onNext={advanceNow}
              />
            )}
          </div>
        )}

        {state.status === 'results' && (
          <div className="screen-enter">
            <ResultsSummary
              answers={state.answers}
              categoryLabel={selectedCategoryLabel}
              difficultyLabel={selectedDifficultyLabel}
              customQuizTitle={
                state.source === 'custom' ? state.customQuizTitle : null
              }
              onPlayAgain={resetQuiz}
              onRetryWrong={retryWrong}
              onNotify={showToast}
            />

            <hr className="divider" />

            <ReviewAccordion answers={state.answers} />
          </div>
        )}
      </section>

      <Toast message={toastMessage} />
    </main>
  );
}
