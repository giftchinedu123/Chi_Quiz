import { shuffle } from '../utils/shuffle';

export const initialQuizState = {
  status: 'setup',
  categoryId: null,
  difficulty: 'any',
  source: 'api',
  customQuizTitle: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  error: null,
};

function buildCustomQuestions(customQuiz) {
  const mapped = customQuiz.questions.map((item) => {
    const correct = item.options[item.correctIndex];
    return {
      id: item.id,
      question: item.question,
      correct,
      options: shuffle(item.options),
      category: customQuiz.title,
      difficulty: 'custom',
    };
  });
  return shuffle(mapped);
}

export function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORY': {
      if (state.status !== 'setup') return state;
      return {
        ...state,
        categoryId: action.payload,
      };
    }

    case 'SET_DIFFICULTY': {
      if (state.status !== 'setup') return state;
      return {
        ...state,
        difficulty: action.payload,
      };
    }

    case 'START': {
      if (
        state.status !== 'setup' &&
        state.status !== 'error' &&
        state.status !== 'results'
      ) {
        return state;
      }
      return {
        ...state,
        status: 'loading',
        source: 'api',
        customQuizTitle: null,
        questions: [],
        currentIndex: 0,
        answers: [],
        error: null,
      };
    }

    case 'START_CUSTOM': {
      if (state.status !== 'setup' && state.status !== 'results') {
        return state;
      }
      const prepared = buildCustomQuestions(action.payload);
      if (prepared.length === 0) return state;

      return {
        ...state,
        status: 'question',
        source: 'custom',
        customQuizTitle: action.payload.title,
        questions: prepared,
        currentIndex: 0,
        answers: [],
        error: null,
      };
    }

    case 'QUESTIONS_LOADED': {
      if (state.status !== 'loading') return state;
      if (action.payload.length === 0) return state;

      return {
        ...state,
        status: 'question',
        questions: action.payload,
        currentIndex: 0,
        answers: [],
        error: null,
      };
    }

    case 'LOAD_FAILED': {
      if (state.status !== 'loading') return state;
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    }

    case 'ANSWER': {
      if (state.status !== 'question') return state;
      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion) return state;
      if (state.answers.length > state.currentIndex) return state;

      const selectedOption = action.payload.selectedOption;
      const isCorrect = selectedOption === currentQuestion.correct;

      const record = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedOption,
        correctOption: currentQuestion.correct,
        options: currentQuestion.options,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        outcome: isCorrect ? 'correct' : 'wrong',
      };

      return {
        ...state,
        status: 'feedback',
        answers: [...state.answers, record],
      };
    }

    case 'TIME_UP': {
      if (state.status !== 'question') return state;
      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion) return state;
      if (state.answers.length > state.currentIndex) return state;

      const record = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedOption: null,
        correctOption: currentQuestion.correct,
        options: currentQuestion.options,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        outcome: 'timeout',
      };

      return {
        ...state,
        status: 'feedback',
        answers: [...state.answers, record],
      };
    }

    case 'NEXT': {
      if (state.status !== 'feedback') return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          status: 'results',
        };
      }
      return {
        ...state,
        status: 'question',
        currentIndex: nextIndex,
      };
    }

    case 'FINISH': {
      if (state.status !== 'feedback') return state;
      return {
        ...state,
        status: 'results',
      };
    }

    case 'RETRY_WRONG': {
      if (state.status !== 'results') return state;

      const wrongIds = new Set(
        state.answers
          .filter((answer) => answer.outcome !== 'correct')
          .map((answer) => answer.questionId)
      );

      if (wrongIds.size === 0) return state;

      const retryQuestions = shuffle(
        state.questions
          .filter((question) => wrongIds.has(question.id))
          .map((question) => ({
            ...question,
            options: shuffle(question.options),
          }))
      );

      if (retryQuestions.length === 0) return state;

      return {
        ...state,
        status: 'question',
        questions: retryQuestions,
        currentIndex: 0,
        answers: [],
        error: null,
      };
    }

    case 'RESET': {
      return {
        ...state,
        status: 'setup',
        source: 'api',
        customQuizTitle: null,
        questions: [],
        currentIndex: 0,
        answers: [],
        error: null,
      };
    }

    default:
      return state;
  }
}
