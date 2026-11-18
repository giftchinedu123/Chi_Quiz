export const CATEGORIES = [
  { id: null, label: 'Any Category' },
  { id: 9, label: 'General Knowledge' },
  { id: 17, label: 'Science & Nature' },
  { id: 18, label: 'Computers' },
  { id: 22, label: 'Geography' },
  { id: 23, label: 'History' },
  { id: 21, label: 'Sports' },
  { id: 11, label: 'Film' },
  { id: 12, label: 'Music' },
  { id: 15, label: 'Video Games' },
  { id: 27, label: 'Animals' },
];

export const DIFFICULTIES = [
  { value: 'any', label: 'Any' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const DEFAULT_QUESTION_AMOUNT = 15;
export const FALLBACK_QUESTION_AMOUNTS = [10, 5];

export const QUESTION_DURATION_MS = 10000;
export const FEEDBACK_AUTO_ADVANCE_MS = 1500;
export const RATE_LIMIT_COOLDOWN_SECONDS = 5;

export const CUSTOM_QUIZZES_STORAGE_KEY = 'gift_quiz_custom_quizzes_v1';
export const MIN_CUSTOM_QUIZ_QUESTIONS = 3;
