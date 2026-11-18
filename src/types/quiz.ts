export type DifficultyOption = 'any' | 'easy' | 'medium' | 'hard';

export interface CategoryOption {
  id: number | null;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correct: string;
  options: string[];
  category: string;
  difficulty: string;
}

export type AnswerOutcome = 'correct' | 'wrong' | 'timeout';

export interface QuizAnswerRecord {
  questionId: string;
  question: string;
  selectedOption: string | null;
  correctOption: string;
  options: string[];
  category: string;
  difficulty: string;
  outcome: AnswerOutcome;
}

export interface CustomQuizQuestionInput {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface CustomQuiz {
  id: string;
  title: string;
  createdAt: number;
  questions: CustomQuizQuestionInput[];
}

export type QuizErrorCode =
  | 'RATE_LIMIT'
  | 'INSUFFICIENT_QUESTIONS'
  | 'NETWORK'
  | 'UNKNOWN';

export interface QuizErrorInfo {
  code: QuizErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export type QuizStatus =
  | 'setup'
  | 'loading'
  | 'question'
  | 'feedback'
  | 'results'
  | 'error';

export interface QuizState {
  status: QuizStatus;
  categoryId: number | null;
  difficulty: DifficultyOption;
  source: 'api' | 'custom';
  customQuizTitle: string | null;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswerRecord[];
  error: QuizErrorInfo | null;
}
