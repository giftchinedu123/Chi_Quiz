import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initialQuizState, quizReducer } from '../reducers/quizReducer';
import type { CustomQuiz, DifficultyOption } from '../types/quiz';
import {
  FEEDBACK_AUTO_ADVANCE_MS,
  QUESTION_DURATION_MS,
} from '../utils/constants';
import { useCountdown } from './useCountdown';
import { useTriviaQuestions } from './useTriviaQuestions';

export function useQuiz() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const { loadQuestions, cancel } = useTriviaQuestions();
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const runCounterRef = useRef(0);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentAnswer = state.answers[state.currentIndex] ?? null;
  const isLastQuestion =
    state.questions.length > 0 &&
    state.currentIndex === state.questions.length - 1;

  const handleTimeUp = useCallback(() => {
    dispatch({ type: 'TIME_UP' });
  }, []);

  const countdown = useCountdown({
    durationMs: QUESTION_DURATION_MS,
    isRunning: state.status === 'question' && currentQuestion !== null,
    resetKey: `${runCounterRef.current}-${state.currentIndex}-${currentQuestion?.id ?? 'none'}`,
    onExpire: handleTimeUp,
  });

  // Auto-advance after feedback delay; cleaned up on manual advance, quit, or unmount
  useEffect(() => {
    if (state.status !== 'feedback') {
      clearAutoAdvance();
      return;
    }

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      dispatch({ type: isLastQuestion ? 'FINISH' : 'NEXT' });
    }, FEEDBACK_AUTO_ADVANCE_MS);

    return () => {
      clearAutoAdvance();
    };
  }, [state.status, state.currentIndex, isLastQuestion, clearAutoAdvance]);

  const selectCategory = useCallback((categoryId: number | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
  }, []);

  const selectDifficulty = useCallback((difficulty: DifficultyOption) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  }, []);

  const startQuiz = useCallback(() => {
    clearAutoAdvance();
    runCounterRef.current += 1;
    dispatch({ type: 'START' });

    loadQuestions(state.categoryId, state.difficulty, {
      onSuccess: (questions) => {
        dispatch({ type: 'QUESTIONS_LOADED', payload: questions });
      },
      onError: (error) => {
        dispatch({ type: 'LOAD_FAILED', payload: error });
      },
    });
  }, [clearAutoAdvance, loadQuestions, state.categoryId, state.difficulty]);

  const startCustomQuiz = useCallback(
    (customQuiz: CustomQuiz) => {
      cancel();
      clearAutoAdvance();
      runCounterRef.current += 1;
      dispatch({ type: 'START_CUSTOM', payload: customQuiz });
    },
    [cancel, clearAutoAdvance]
  );

  const submitAnswer = useCallback((selectedOption: string) => {
    dispatch({ type: 'ANSWER', payload: { selectedOption } });
  }, []);

  const advanceNow = useCallback(() => {
    clearAutoAdvance();
    dispatch({ type: isLastQuestion ? 'FINISH' : 'NEXT' });
  }, [clearAutoAdvance, isLastQuestion]);

  const retryWrong = useCallback(() => {
    clearAutoAdvance();
    runCounterRef.current += 1;
    dispatch({ type: 'RETRY_WRONG' });
  }, [clearAutoAdvance]);

  const resetQuiz = useCallback(() => {
    cancel();
    clearAutoAdvance();
    dispatch({ type: 'RESET' });
  }, [cancel, clearAutoAdvance]);

  return {
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
  };
}
