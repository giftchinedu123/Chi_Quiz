import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QuizForm } from '../components/QuizForm.jsx';
import { Toast } from '../components/Toast.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CUSTOM_QUIZZES_STORAGE_KEY } from '../utils/constants';

export function Builder() {
  const navigate = useNavigate();
  const [customQuizzes, setCustomQuizzes] = useLocalStorage(
    CUSTOM_QUIZZES_STORAGE_KEY,
    []
  );
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleSaveQuiz = (quiz) => {
    setCustomQuizzes((prev) => [quiz, ...prev]);
    showToast('Quiz saved!');
  };

  const handleDeleteQuiz = (id) => {
    setCustomQuizzes((prev) => prev.filter((q) => q.id !== id));
    showToast('Quiz deleted');
  };

  const handlePlayQuiz = (id) => {
    navigate('/quiz', { state: { customQuizId: id } });
  };

  return (
    <main className="page-shell">
      <section className="quiz-card" aria-label="Teacher quiz builder">
        <div className="screen-enter">
          <div className="card-top-nav">
            <Link to="/quiz" className="back-link">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              <span>Back to quiz</span>
            </Link>
          </div>

          <div className="card-header">
            <span className="pill-label">
              <span className="pill-dot" aria-hidden="true" />
              <span>Teacher Builder</span>
            </span>
            <h1 className="card-heading">Create your own quiz</h1>
            <p className="card-subtitle">
              Build a custom multiple-choice quiz saved locally on this device.
            </p>
          </div>

          <QuizForm onSaveQuiz={handleSaveQuiz} />

          {customQuizzes.length > 0 && (
            <section className="my-quizzes" aria-label="Saved quizzes">
              <hr className="divider" />
              <div className="review-header">
                <h2 className="section-subheading">Saved quizzes</h2>
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
                        onClick={() => handlePlayQuiz(quiz.id)}
                        className="btn-secondary btn-sm"
                      >
                        <i className="fa-solid fa-play" aria-hidden="true" />
                        <span>Play</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz.id)}
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
      </section>

      <Toast message={toastMessage} />
    </main>
  );
}
