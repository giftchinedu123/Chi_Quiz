import { useCallback, useEffect, useRef } from 'react';
import { fetchTriviaQuestions, TriviaApiError } from '../utils/api';

export function useTriviaQuestions() {
  const abortControllerRef = useRef(null);

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
    async (categoryId, difficulty, { onSuccess, onError }) => {
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
            message:
              'Something went wrong while loading questions. Please try again.',
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
