/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer } from "react";
import { mockProfile } from "../data/mockProfile";
import {
  getLearnerDisplayName,
  resolveLanguageLabel,
} from "../../onboarding/profileStorage";

const PBotContext = createContext(null);

const ROUTE_MODE_MAP = {
  home: "Learning",
  learn: "Learning",
  class: "Learning",
  practice: "Practice",
  quiz: "Quiz",
  battle: "Battle",
  achievement: "Learning",
  potential: "Learning",
  rewards: "Learning",
};

const LEARN_VIEWS = new Set([
  "hub",
  "quickNotes",
  "videos",
  "experiments",
  "textbooks",
  "bookmarks",
]);

const QUIZ_QUESTION_BANK = [
  {
    id: "q1",
    title: "Quadratic Functions and Equations",
    prompt: "(4a - b)(2a - 3b) =",
    options: [
      { id: "A", text: "8a² + 3b²" },
      { id: "B", text: "8a² - 3b²" },
      { id: "C", text: "8a² - 14ab + 3b²" },
      { id: "D", text: "8a² - 10ab + 3b²" },
    ],
    correctOption: "C",
    hint: "Kembangkan setiap sebutan, kemudian gabungkan sebutan yang sama.",
    explanation:
      "(4a - b)(2a - 3b)\n= (4a)(2a) - (b)(2a) + (4a)(-3b) - (b)(-3b)\n= 8a² - 2ab - 12ab + 3b²\n= 8a² - 14ab + 3b²",
  },
  {
    id: "q2",
    title: "Function Basics",
    prompt: "Jika f(x)=2x+3, maka f(5) ialah",
    options: [
      { id: "A", text: "10" },
      { id: "B", text: "13" },
      { id: "C", text: "15" },
      { id: "D", text: "8" },
    ],
    correctOption: "B",
    hint: "Ganti x=5 ke dalam fungsi.",
    explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13.",
  },
  {
    id: "q3",
    title: "Number Value",
    prompt: "Nilai | -7 | + 5 ialah",
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "-12" },
      { id: "C", text: "12" },
      { id: "D", text: "-2" },
    ],
    correctOption: "C",
    hint: "Nilai mutlak bagi -7 ialah 7.",
    explanation: "|-7| + 5 = 7 + 5 = 12.",
  },
  {
    id: "q4",
    title: "Simultaneous Equations",
    prompt: "x + y = 6, x - y = 2. Nilai x ialah",
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "4" },
      { id: "C", text: "6" },
      { id: "D", text: "8" },
    ],
    correctOption: "B",
    hint: "Tambah dua persamaan untuk hapuskan y.",
    explanation: "x + y = 6\nx - y = 2\nTambah: 2x = 8, jadi x = 4.",
  },
  {
    id: "q5",
    title: "Graph Interpretation",
    prompt: "Graf meningkat secara linear apabila",
    options: [
      { id: "A", text: "Kecerunan bernilai positif" },
      { id: "B", text: "Kecerunan bernilai sifar" },
      { id: "C", text: "Kecerunan bernilai negatif" },
      { id: "D", text: "Graf melengkung ke bawah" },
    ],
    correctOption: "A",
    hint: "Kecerunan positif bermaksud y meningkat apabila x meningkat.",
    explanation:
      "Graf linear menaik mempunyai kecerunan positif: bila x meningkat, nilai y juga meningkat.",
  },
];

function normalizeRoute(route) {
  const value = (route || "home").toLowerCase();
  return ROUTE_MODE_MAP[value] ? value : "home";
}

function getModeFromRoute(route) {
  return ROUTE_MODE_MAP[normalizeRoute(route)] || "Learning";
}

function normalizeLearnView(view) {
  if (!view) {
    return "hub";
  }

  return LEARN_VIEWS.has(view) ? view : "hub";
}

function clampQuizTotal(total) {
  const parsed = Number(total) || 5;
  return Math.max(1, Math.min(QUIZ_QUESTION_BANK.length, parsed));
}

function getQuestionByIndex(index) {
  const safeIndex = Math.max(0, Number(index) || 0) % QUIZ_QUESTION_BANK.length;
  return QUIZ_QUESTION_BANK[safeIndex];
}

function createQuizContext() {
  return {
    inProgress: false,
    currentIndex: 0,
    total: 5,
    answeredCount: 0,
    correctCount: 0,
    selectedOption: null,
    saved: false,
    isCorrect: null,
    checking: false,
    showHint: false,
    eliminatedOptions: [],
  };
}

function resetQuestionState(quizContext) {
  return {
    ...quizContext,
    selectedOption: null,
    saved: false,
    isCorrect: null,
    checking: false,
    showHint: false,
    eliminatedOptions: [],
  };
}

function getInitialState(profile = {}) {
  const defaultGoal = Number(mockProfile.dailyGoalTarget) || 6;
  const defaultProgress = Number(mockProfile.dailyGoalCompleted) || 3;
  const learnerName = getLearnerDisplayName(profile.learnerName || mockProfile.name, "Learner");
  const learnerLanguage = resolveLanguageLabel(
    profile.preferredLanguage || mockProfile.language || "BM",
    mockProfile.language || "BM",
  );

  return {
    userContext: {
      name: learnerName,
      segment: "Regular Learner",
      level: mockProfile.level || "KSSM F4",
      language: learnerLanguage,
      dailyGoal: defaultGoal,
      goalProgress: defaultProgress,
    },
    pageContext: {
      route: "home",
      mode: getModeFromRoute("home"),
      learnView: null,
      selectedSubject: null,
      selectedTopic: null,
    },
    sessionContext: {
      lastActivity: mockProfile.lastQuiz
        ? {
            title: mockProfile.lastQuiz.title,
            subject: mockProfile.lastQuiz.subject,
            topic: mockProfile.lastQuiz.topic,
            route: "quiz",
            target: mockProfile.lastQuiz.target,
          }
        : null,
      lastSubject: mockProfile.lastQuiz?.subject || null,
      lastTopic: mockProfile.lastQuiz?.topic || null,
    },
    quizContext: createQuizContext(),
    uiContext: {
      topicPickerHighlighted: false,
    },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "set_route": {
      const route = normalizeRoute(action.route);
      const shouldStopQuiz = route !== "quiz";
      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          route,
          mode: getModeFromRoute(route),
          learnView: route === "learn" ? state.pageContext.learnView : null,
        },
        quizContext: shouldStopQuiz
          ? { ...resetQuestionState(state.quizContext), inProgress: false }
          : state.quizContext,
      };
    }
    case "open_learn_view": {
      const nextSubject =
        Object.prototype.hasOwnProperty.call(action, "subject")
          ? action.subject || null
          : state.pageContext.selectedSubject;
      const nextTopic =
        Object.prototype.hasOwnProperty.call(action, "topic")
          ? action.topic || null
          : nextSubject !== state.pageContext.selectedSubject
            ? null
            : state.pageContext.selectedTopic;

      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          route: "learn",
          mode: getModeFromRoute("learn"),
          learnView: normalizeLearnView(action.view),
          selectedSubject: nextSubject,
          selectedTopic: nextTopic,
        },
        quizContext: { ...resetQuestionState(state.quizContext), inProgress: false },
      };
    }
    case "close_learn_view": {
      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          route: "home",
          mode: getModeFromRoute("home"),
          learnView: null,
        },
        quizContext: { ...resetQuestionState(state.quizContext), inProgress: false },
      };
    }
    case "set_selected_subject": {
      const subject = action.subject || null;
      const shouldClearTopic = state.pageContext.selectedSubject !== subject;
      const shouldStopQuiz = subject !== "Mathematics";

      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          selectedSubject: subject,
          selectedTopic: shouldClearTopic ? null : state.pageContext.selectedTopic,
        },
        sessionContext: {
          ...state.sessionContext,
          lastSubject: subject || state.sessionContext.lastSubject,
        },
        quizContext: shouldStopQuiz
          ? { ...resetQuestionState(state.quizContext), inProgress: false }
          : state.quizContext,
      };
    }
    case "set_selected_topic": {
      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          selectedTopic: action.topic || null,
        },
        sessionContext: {
          ...state.sessionContext,
          lastSubject: state.pageContext.selectedSubject || state.sessionContext.lastSubject,
          lastTopic: action.topic || state.sessionContext.lastTopic,
        },
      };
    }
    case "clear_topic": {
      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          selectedTopic: null,
        },
        quizContext: { ...resetQuestionState(state.quizContext), inProgress: false },
      };
    }
    case "set_last_activity": {
      if (!action.activity) {
        return state;
      }
      return {
        ...state,
        sessionContext: {
          ...state.sessionContext,
          lastActivity: action.activity,
          lastSubject: action.activity.subject || state.sessionContext.lastSubject,
          lastTopic: action.activity.topic || state.sessionContext.lastTopic,
        },
      };
    }
    case "set_goal_progress": {
      const nextProgress = Math.max(0, Number(action.progress) || 0);
      return {
        ...state,
        userContext: {
          ...state.userContext,
          goalProgress: nextProgress,
        },
      };
    }
    case "start_quiz": {
      const topic =
        action.topic ||
        state.pageContext.selectedTopic ||
        state.sessionContext.lastTopic ||
        "Functions";

      return {
        ...state,
        pageContext: {
          ...state.pageContext,
          route: "quiz",
          mode: getModeFromRoute("quiz"),
          selectedSubject: "Mathematics",
          selectedTopic: topic,
        },
        quizContext: {
          ...createQuizContext(),
          inProgress: true,
          total: clampQuizTotal(action.total),
        },
      };
    }
    case "stop_quiz": {
      return {
        ...state,
        quizContext: { ...resetQuestionState(state.quizContext), inProgress: false },
      };
    }
    case "select_quiz_option": {
      if (!state.quizContext.inProgress || state.quizContext.checking) {
        return state;
      }

      return {
        ...state,
        quizContext: {
          ...state.quizContext,
          selectedOption: action.option || null,
          saved: false,
          isCorrect: null,
          checking: false,
        },
      };
    }
    case "set_quiz_checking": {
      return {
        ...state,
        quizContext: {
          ...state.quizContext,
          checking: Boolean(action.checking),
        },
      };
    }
    case "finalize_quiz_save": {
      if (!state.quizContext.inProgress) {
        return state;
      }

      return {
        ...state,
        quizContext: {
          ...state.quizContext,
          answeredCount: state.quizContext.answeredCount + 1,
          correctCount:
            state.quizContext.correctCount + (action.isCorrect ? 1 : 0),
          checking: false,
          saved: true,
          isCorrect: Boolean(action.isCorrect),
        },
      };
    }
    case "next_quiz_question": {
      if (!state.quizContext.inProgress) {
        return state;
      }

      const nextIndex =
        (state.quizContext.currentIndex + 1) % clampQuizTotal(state.quizContext.total);
      return {
        ...state,
        quizContext: {
          ...resetQuestionState(state.quizContext),
          currentIndex: nextIndex,
        },
      };
    }
    case "retry_quiz_question": {
      if (!state.quizContext.inProgress) {
        return state;
      }

      return {
        ...state,
        quizContext: resetQuestionState(state.quizContext),
      };
    }
    case "set_quiz_hint_visible": {
      if (!state.quizContext.inProgress) {
        return state;
      }

      return {
        ...state,
        quizContext: {
          ...state.quizContext,
          showHint: Boolean(action.visible),
        },
      };
    }
    case "set_quiz_eliminated_options": {
      if (!state.quizContext.inProgress) {
        return state;
      }

      return {
        ...state,
        quizContext: {
          ...state.quizContext,
          eliminatedOptions: action.options || [],
        },
      };
    }
    case "set_topic_picker_highlight": {
      return {
        ...state,
        uiContext: {
          ...state.uiContext,
          topicPickerHighlighted: Boolean(action.highlighted),
        },
      };
    }
    default: {
      return state;
    }
  }
}

function getPBotState({ pageContext, quizContext }) {
  const subject = pageContext.selectedSubject;

  if (pageContext.route === "learn") {
    return "learn";
  }

  if (subject && subject !== "Mathematics") {
    return "unsupported";
  }

  if (quizContext.inProgress && subject === "Mathematics") {
    return "quiz";
  }

  if (subject === "Mathematics") {
    return "subject_selected";
  }

  if (pageContext.route === "home") {
    return "home";
  }

  return "home";
}

function getContextStage(pageContext, pbotState) {
  if (pbotState === "unsupported") {
    return "state_unsupported";
  }

  if (pbotState === "learn") {
    return "state_learn";
  }

  if (pbotState === "home") {
    return "state_a_home";
  }

  if (pageContext.selectedTopic) {
    return "state_c_topic";
  }

  return "state_b_subject";
}

function getQuizSubState(quizContext) {
  if (!quizContext.inProgress) {
    return null;
  }

  if (quizContext.checking) {
    return "checking";
  }

  if (!quizContext.selectedOption) {
    return "awaiting_selection";
  }

  if (!quizContext.saved) {
    return "selected_not_saved";
  }

  return quizContext.isCorrect ? "saved_correct" : "saved_wrong";
}

export function PBotContextProvider({ children, profile }) {
  const [state, dispatch] = useReducer(reducer, profile, getInitialState);

  const value = useMemo(() => {
    const pbotState = getPBotState(state);
    const contextStage = getContextStage(state.pageContext, pbotState);
    const isMathSelected = state.pageContext.selectedSubject === "Mathematics";
    const currentQuestion = getQuestionByIndex(state.quizContext.currentIndex);
    const quizContext = {
      ...state.quizContext,
      total: clampQuizTotal(state.quizContext.total),
      currentQuestion,
      subState: getQuizSubState(state.quizContext),
    };

    return {
      ...state,
      quizContext,
      pbotState,
      contextStage,
      isMathSelected,
      actions: {
        setRoute: (route) => dispatch({ type: "set_route", route }),
        openLearnView: (view, options = {}) =>
          dispatch({
            type: "open_learn_view",
            view,
            ...(Object.prototype.hasOwnProperty.call(options, "subject")
              ? { subject: options.subject }
              : {}),
            ...(Object.prototype.hasOwnProperty.call(options, "topic")
              ? { topic: options.topic }
              : {}),
          }),
        closeLearnView: () => dispatch({ type: "close_learn_view" }),
        setSelectedSubject: (subject) =>
          dispatch({ type: "set_selected_subject", subject }),
        setSelectedTopic: (topic) => dispatch({ type: "set_selected_topic", topic }),
        clearTopic: () => dispatch({ type: "clear_topic" }),
        setLastActivity: (activity) =>
          dispatch({ type: "set_last_activity", activity }),
        setGoalProgress: (progress) =>
          dispatch({ type: "set_goal_progress", progress }),
        startQuiz: (payload = {}) =>
          dispatch({
            type: "start_quiz",
            topic: payload.topic,
            total: payload.total,
          }),
        stopQuiz: () => dispatch({ type: "stop_quiz" }),
        selectQuizOption: (option) =>
          dispatch({ type: "select_quiz_option", option }),
        saveQuizAnswer: () => {
          if (
            !state.quizContext.inProgress ||
            state.quizContext.checking ||
            state.quizContext.saved ||
            !state.quizContext.selectedOption
          ) {
            return;
          }

          const question = getQuestionByIndex(state.quizContext.currentIndex);
          const isCorrect = state.quizContext.selectedOption === question.correctOption;
          dispatch({ type: "set_quiz_checking", checking: true });
          setTimeout(() => {
            dispatch({ type: "finalize_quiz_save", isCorrect });
          }, 420);
        },
        nextQuizQuestion: () => dispatch({ type: "next_quiz_question" }),
        retryQuizQuestion: () => dispatch({ type: "retry_quiz_question" }),
        toggleQuizHint: () =>
          dispatch({
            type: "set_quiz_hint_visible",
            visible: !state.quizContext.showHint,
          }),
        showQuizHint: () =>
          dispatch({ type: "set_quiz_hint_visible", visible: true }),
        hideQuizHint: () =>
          dispatch({ type: "set_quiz_hint_visible", visible: false }),
        eliminateTwoChoices: () => {
          if (!state.quizContext.inProgress) {
            return;
          }

          const question = getQuestionByIndex(state.quizContext.currentIndex);
          const incorrect = question.options
            .map((option) => option.id)
            .filter((optionId) => optionId !== question.correctOption);
          const selected = state.quizContext.selectedOption;
          const preferred = incorrect.filter((optionId) => optionId !== selected);
          const eliminated = preferred.slice(0, 2);

          if (eliminated.length < 2) {
            const extra = incorrect.filter((optionId) => !eliminated.includes(optionId));
            eliminated.push(...extra.slice(0, 2 - eliminated.length));
          }

          dispatch({
            type: "set_quiz_eliminated_options",
            options: eliminated,
          });
        },
        clearQuizElimination: () =>
          dispatch({ type: "set_quiz_eliminated_options", options: [] }),
        requestTopicPickerFocus: () => {
          dispatch({ type: "set_topic_picker_highlight", highlighted: true });
          setTimeout(() => {
            dispatch({ type: "set_topic_picker_highlight", highlighted: false });
          }, 1200);
        },
      },
    };
  }, [state]);

  return <PBotContext.Provider value={value}>{children}</PBotContext.Provider>;
}

export function usePBotContext() {
  const ctx = useContext(PBotContext);
  if (!ctx) {
    throw new Error("usePBotContext must be used inside PBotContextProvider");
  }
  return ctx;
}

export function getRouteLabel(route) {
  const value = normalizeRoute(route);
  return value.charAt(0).toUpperCase() + value.slice(1);
}
