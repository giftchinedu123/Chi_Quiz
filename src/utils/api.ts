import type {
  DifficultyOption,
  QuizErrorCode,
  QuizErrorInfo,
  QuizQuestion,
} from '../types/quiz';
import {
  DEFAULT_QUESTION_AMOUNT,
  FALLBACK_QUESTION_AMOUNTS,
  RATE_LIMIT_COOLDOWN_SECONDS,
} from './constants';
import { decodeHtml } from './decodeHtml';
import { shuffle } from './shuffle';

interface OpenTriviaRawQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTriviaResponse {
  response_code: number;
  results: OpenTriviaRawQuestion[];
}

export class TriviaApiError extends Error {
  readonly code: QuizErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(info: QuizErrorInfo) {
    super(info.message);
    this.name = 'TriviaApiError';
    this.code = info.code;
    this.retryAfterSeconds = info.retryAfterSeconds;
  }

  toErrorInfo(): QuizErrorInfo {
    return {
      code: this.code,
      message: this.message,
      retryAfterSeconds: this.retryAfterSeconds,
    };
  }
}

function buildTriviaUrl(
  amount: number,
  categoryId: number | null,
  difficulty: DifficultyOption
): string {
  const params = new URLSearchParams({
    amount: String(amount),
    type: 'multiple',
  });

  if (categoryId !== null) {
    params.set('category', String(categoryId));
  }

  if (difficulty !== 'any') {
    params.set('difficulty', difficulty);
  }

  return `https://opentdb.com/api.php?${params.toString()}`;
}

function normalizeQuestion(
  raw: OpenTriviaRawQuestion,
  index: number
): QuizQuestion {
  const question = decodeHtml(raw.question);
  const correct = decodeHtml(raw.correct_answer);
  const incorrect = raw.incorrect_answers.map(decodeHtml);

  return {
    id: `otdb-${index}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    correct,
    options: shuffle([correct, ...incorrect]),
    category: decodeHtml(raw.category),
    difficulty: raw.difficulty,
  };
}

async function fetchBatch(
  amount: number,
  categoryId: number | null,
  difficulty: DifficultyOption,
  signal?: AbortSignal
): Promise<OpenTriviaResponse> {
  const url = buildTriviaUrl(amount, categoryId, difficulty);
  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new TriviaApiError({
      code: 'NETWORK',
      message:
        'Unable to reach the trivia server. Please check your internet connection and try again.',
    });
  }

  if (response.status === 429) {
    throw new TriviaApiError({
      code: 'RATE_LIMIT',
      message: 'Too many requests, please wait a few seconds.',
      retryAfterSeconds: RATE_LIMIT_COOLDOWN_SECONDS,
    });
  }

  if (!response.ok) {
    throw new TriviaApiError({
      code: 'NETWORK',
      message: `The trivia service returned an error (HTTP ${response.status}). Please try again.`,
    });
  }

  let data: OpenTriviaResponse;
  try {
    data = (await response.json()) as OpenTriviaResponse;
  } catch {
    throw new TriviaApiError({
      code: 'UNKNOWN',
      message: 'Received an unexpected response from the trivia server.',
    });
  }

  return data;
}

export async function fetchTriviaQuestions(
  categoryId: number | null,
  difficulty: DifficultyOption,
  signal?: AbortSignal
): Promise<QuizQuestion[]> {
  const amountsToTry = [DEFAULT_QUESTION_AMOUNT, ...FALLBACK_QUESTION_AMOUNTS];

  for (const amount of amountsToTry) {
    const data = await fetchBatch(amount, categoryId, difficulty, signal);

    if (data.response_code === 0 && Array.isArray(data.results) && data.results.length > 0) {
      return data.results.map(normalizeQuestion);
    }

    if (data.response_code === 5) {
      throw new TriviaApiError({
        code: 'RATE_LIMIT',
        message: 'Too many requests, please wait a few seconds.',
        retryAfterSeconds: RATE_LIMIT_COOLDOWN_SECONDS,
      });
    }

    if (data.response_code === 1) {
      // Not enough questions for this amount; loop continues with a smaller amount.
      continue;
    }

    throw new TriviaApiError({
      code: 'UNKNOWN',
      message:
        'Could not load questions for those settings. Please try another category or difficulty.',
    });
  }

  throw new TriviaApiError({
    code: 'INSUFFICIENT_QUESTIONS',
    message:
      'There are not enough questions available for this category and difficulty yet. Try choosing another category or setting difficulty to Any.',
  });
}
