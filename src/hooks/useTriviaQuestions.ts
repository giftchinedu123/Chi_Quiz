import { useCallback, useEffect, useRef } from 'react';
import type {
  DifficultyOption,
  QuizErrorInfo,
  QuizQuestion,
} from '../types/quiz';
import { fetchTriviaQuestions, TriviaApiError } from '../utils/api';

interface LoadCallbacks {
  onSuccess: (questions: QuizQuestion[]) => void;
  onError: (error: QuizErrorInfo) => void;
}

export function useTriviaQuestions() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const loadQuestions = useCallback(
    async (
      categoryId: number | null,
      difficulty: DifficultyOption,
      { onSuccess, onError }: LoadCallbacks
    ) => {
      cancel();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const questions = await fetchTriviaQuestions(
          categoryId,
          difficulty,
          controller.signal
        );
        if (!controller.signal.aborted) {
          onSuccess(questions);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (controller.signal.aborted) {
          return;
        }
        if (err instanceof TriviaApiError) {
          onError(err.toErrorInfo());
        } else {
          onError({
            code: 'UNKNOWN',
            message: 'Something went wrong while loading questions. Please try again.',
          });
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [cancel]
  );

  return {
    loadQuestions,
    cancel,
  };
}
