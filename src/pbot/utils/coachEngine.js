import {
  buildPracticeRoute,
  buildSubjectAnalysisRoute,
  rankFocusTopics,
} from "./subjectAnalysis";

const MATH_ONLY_MESSAGE =
  "This PBot prototype currently supports Mathematics only. Please choose Mathematics to continue.";

function getGoalLine(userContext) {
  const progress = Math.max(0, Number(userContext.goalProgress) || 0);
  const target = Math.max(0, Number(userContext.dailyGoal) || 0);
  return `Goal: ${progress}/${target}`;
}

function getLastActivityTitle(sessionContext) {
  return sessionContext.lastActivity?.title || "—";
}

function hasMathLastActivity(sessionContext) {
  return sessionContext.lastActivity?.subject === "Mathematics";
}

export function generateCoachFromSubjectAnalysis(
  analysis,
  behaviourSignals,
  dailyGoalProgress,
) {
  if (!analysis) {
    return "Continue learning with one focus topic today.";
  }

  const focusTopics = rankFocusTopics(analysis, 3);
  const firstFocus = focusTopics[0];
  const notStartedCount = analysis.topics.filter((topic) =>
    topic.status.toLowerCase().includes("not started"),
  ).length;
  const goalRemaining = Math.max(
    0,
    (dailyGoalProgress.target || 0) - (dailyGoalProgress.completed || 0),
  );

  if (notStartedCount >= 2 && firstFocus) {
    return `Strong progress in ${analysis.subjectName}. Start ${firstFocus.topicName} with 2 quick quizzes.`;
  }

  const hots = analysis.thinkingSkills.hots;
  if ((hots !== null && hots <= 30) || (behaviourSignals?.quitAfterWrongRate ?? 0) > 25) {
    return "HOTS is still low. Try practice with hints to build confidence.";
  }

  if (goalRemaining > 0 && firstFocus) {
    return `Focus on ${firstFocus.topicName} first. ${goalRemaining} more quizzes to reach today's target.`;
  }

  return "Performance is stable. Try one more challenging topic.";
}

function buildHomeSnapshot({ userContext, sessionContext }) {
  const hasLastActivity = Boolean(sessionContext.lastActivity);

  return {
    statusLine: `${getGoalLine(userContext)} • Last: ${getLastActivityTitle(sessionContext)}`,
    message:
      "Ready to learn? Choose Mathematics or continue your last activity.",
    quickActions: [
      {
        id: "continue-last-activity",
        label: "Continue last activity",
        intent: "continue_last_activity",
        disabled: !hasLastActivity,
      },
      {
        id: "go-to-math",
        label: "Go to Mathematics",
        intent: "go_to_mathematics",
      },
      {
        id: "start-quick-home",
        label: "Start quick 2-quiz",
        intent: "start_quick_two",
      },
    ],
  };
}

function buildSubjectSnapshot({ userContext, sessionContext }) {
  const actions = [
    {
      id: "choose-topic",
      label: "Choose a topic",
      intent: "choose_topic",
    },
    {
      id: "subject-open-notes",
      label: "Quick Notes",
      intent: "open_quick_notes",
    },
  ];

  if (hasMathLastActivity(sessionContext)) {
    actions.push({
      id: "continue-last-quiz-math",
      label: "Continue last quiz (Math)",
      intent: "continue_last_activity",
    });
  }

  return {
    statusLine: `Mathematics selected • ${getGoalLine(userContext)}`,
    message: "Okay, we will focus on Mathematics. Choose one topic to start.",
    quickActions: actions.slice(0, 3),
  };
}

function buildDeepDiveSnapshot({ userContext, behaviourSignals, subjectDeepDive }) {
  const analysis = subjectDeepDive.analysis;
  const focusTopics = rankFocusTopics(analysis, 3);
  const firstFocus = focusTopics[0];
  const progress = {
    completed: Math.max(0, Number(userContext.goalProgress) || 0),
    target: Math.max(0, Number(userContext.dailyGoal) || 0),
  };
  const summaryScore =
    analysis.scorePercent === null ? "-" : `${analysis.scorePercent}%`;
  const statusLine = `${analysis.subjectName} • ${analysis.grade || "-"} (${summaryScore})`;

  const actions = [];
  if (firstFocus?.topicUrl) {
    actions.push({
      id: "deep-focus-topic",
      label: `Start ${firstFocus.topicName}`,
      intent: "open_link",
      target: firstFocus.topicUrl,
    });
  }
  actions.push({
    id: "deep-practice",
    label: `Practice ${analysis.subjectName}`,
    intent: "open_link",
    target: buildPracticeRoute(analysis.subjectKey, firstFocus?.topicName || ""),
  });
  actions.push({
    id: "deep-open-analysis",
    label: "Open full analysis",
    intent: "open_link",
    target: buildSubjectAnalysisRoute(analysis.level, analysis.subjectKey),
  });

  return {
    statusLine,
    message: generateCoachFromSubjectAnalysis(analysis, behaviourSignals, progress),
    quickActions: actions.slice(0, 3),
  };
}

function buildQuizSnapshot({ userContext, quizContext }) {
  const questionNumber = (quizContext.displayIndex ?? quizContext.currentIndex) + 1;
  const statusLine = `Quiz: ${questionNumber}/${quizContext.total} • ${getGoalLine(userContext)}`;

  if (quizContext.subState === "reviewing_final") {
    const onFinalReviewQuestion = questionNumber === quizContext.total;
    const reviewActions = [];

    if (questionNumber > 1) {
      reviewActions.push({
        id: "review-previous-question",
        label: "Previous",
        intent: "previous_review_question",
      });
    }

    reviewActions.push(
      onFinalReviewQuestion
        ? {
            id: "review-submit-answer",
            label: "Submit Answer",
            intent: "submit_quiz_set",
          }
        : {
            id: "review-next-question",
            label: "Next",
            intent: "next_question",
          },
    );

    return {
      statusLine: `Review: ${questionNumber}/${quizContext.total} • Read-only`,
      message: onFinalReviewQuestion
        ? "This is the last question. Review previous questions or submit when you are ready."
        : `You are reviewing question ${questionNumber}/${quizContext.total}. Answers cannot be changed.`,
      quickActions: reviewActions,
    };
  }

  if (quizContext.subState === "checking") {
    return {
      statusLine,
      message: "Thinking...",
      quickActions: [],
    };
  }

  if (quizContext.subState === "awaiting_selection") {
    return {
      statusLine,
      message:
        questionNumber === quizContext.total
          ? "Last question. Choose an answer first, then we will check before submitting."
          : "Choose an answer first. If you are unsure, press Hint.",
      quickActions: [
        {
          id: "hint-before-select",
          label: "Hint",
          intent: "hint",
        },
        {
          id: "eliminate-two",
          label: "Eliminate 2 choices",
          intent: "eliminate_two",
        },
        {
          id: "quiz-video",
          label: "Video",
          intent: "open_videos",
        },
      ],
    };
  }

  if (quizContext.subState === "selected_not_saved") {
    return {
      statusLine,
      message:
        questionNumber === quizContext.total
          ? `This is the last question. Choice ${quizContext.selectedOption}. Press Save Answer to check before submitting.`
          : `Okay, you chose ${quizContext.selectedOption}. Do you want me to check quickly before saving?`,
      quickActions: [
        {
          id: "review-first",
          label: "Review first",
          intent: "review_before_save",
        },
        {
          id: "save-answer",
          label: "Save Answer",
          intent: "save_answer",
        },
      ],
    };
  }

  if (quizContext.subState === "saved_correct") {
    return {
      statusLine,
      message: "Nice. Let's continue to the next question.",
      quickActions: [
        {
          id: "next-question",
          label: "Next question",
          intent: "next_question",
        },
        {
          id: "harder",
          label: "Harder",
          intent: "harder",
        },
      ],
    };
  }

  return {
    statusLine,
    message: "Wrong answer saved. Check the hint or explanation, then continue.",
    quickActions: [
      {
        id: "show-hint-wrong",
        label: "Show hint",
        intent: "show_hint",
      },
      {
        id: "open-notes",
        label: "Quick Notes",
        intent: "open_quick_notes",
      },
      {
        id: "next-after-wrong",
        label: "Next question",
        intent: "next_question",
      },
    ],
  };
}

function getLearnLabel(view) {
  const labels = {
    hub: "Learning Hub",
    quickNotes: "Quick Notes",
    videos: "Videos",
    experiments: "Experiments",
    textbooks: "Textbooks",
    bookmarks: "Bookmarks",
  };
  return labels[view] || "Learning Hub";
}

function buildLearnSnapshot({ userContext, pageContext }) {
  const learnView = pageContext.learnView || "hub";
  const subject = pageContext.selectedSubject || "Mathematics";
  const statusLine = `${getLearnLabel(learnView)} • ${getGoalLine(userContext)}`;

  if (learnView === "quickNotes") {
    return {
      statusLine,
      message: `You are in Quick Notes for ${subject}. Start with the first chapter, then continue with a quick quiz.`,
      quickActions: [
        { id: "learn-notes-video", label: "Open Videos", intent: "open_videos" },
        { id: "learn-notes-quiz", label: "Start quick 2-quiz", intent: "start_quick_two" },
        { id: "learn-notes-book", label: "Open Textbooks", intent: "open_textbook" },
      ],
    };
  }

  if (learnView === "videos") {
    return {
      statusLine,
      message: `Choose one short video for ${subject}, then try 2 practice questions.`,
      quickActions: [
        { id: "learn-video-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
        { id: "learn-video-quiz", label: "Start quick 2-quiz", intent: "start_quick_two" },
        { id: "learn-video-bookmark", label: "Open Bookmarks", intent: "open_bookmarks" },
      ],
    };
  }

  if (learnView === "experiments") {
    return {
      statusLine,
      message: `Great for understanding concepts. Choose one ${subject} experiment, then check your understanding with a quiz.`,
      quickActions: [
        { id: "learn-exp-video", label: "Open Videos", intent: "open_videos" },
        { id: "learn-exp-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
        { id: "learn-exp-quiz", label: "Start quick 2-quiz", intent: "start_quick_two" },
      ],
    };
  }

  if (learnView === "textbooks") {
    return {
      statusLine,
      message: "Use the textbook for difficult concepts, then do short practice to keep momentum.",
      quickActions: [
        { id: "learn-book-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
        { id: "learn-book-video", label: "Open Videos", intent: "open_videos" },
        { id: "learn-book-quiz", label: "Start quick 2-quiz", intent: "start_quick_two" },
      ],
    };
  }

  if (learnView === "bookmarks") {
    return {
      statusLine,
      message: "If you do not have bookmarks yet, continue practice first. After submitting, you can save important questions.",
      quickActions: [
        { id: "learn-bookmark-practice", label: "Go Practice", intent: "go_practice" },
        { id: "learn-bookmark-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
        { id: "learn-bookmark-hub", label: "Open Learning Hub", intent: "open_learning_hub" },
      ],
    };
  }

  return {
    statusLine,
    message: `You are in Learning Hub. Choose a subject first, then I can suggest notes, videos, or quizzes.`,
    quickActions: [
      { id: "learn-hub-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
      { id: "learn-hub-videos", label: "Open Videos", intent: "open_videos" },
      { id: "learn-hub-book", label: "Open Textbooks", intent: "open_textbook" },
    ],
  };
}

function buildUnsupportedSnapshot({ userContext }) {
  return {
    statusLine: getGoalLine(userContext),
    message: MATH_ONLY_MESSAGE,
    quickActions: [
      {
        id: "switch-to-math",
        label: "Switch to Mathematics",
        intent: "switch_to_mathematics",
      },
    ],
  };
}

export function buildCoachSnapshot({
  userContext,
  pageContext,
  sessionContext,
  pbotState,
  quizContext,
  behaviourSignals,
  subjectDeepDive,
}) {
  if (pbotState === "unsupported") {
    return {
      ...buildUnsupportedSnapshot({ userContext }),
      restrictionMessage: MATH_ONLY_MESSAGE,
    };
  }

  if (pbotState === "quiz") {
    return {
      ...buildQuizSnapshot({ userContext, quizContext }),
      restrictionMessage: MATH_ONLY_MESSAGE,
    };
  }

  if (pbotState === "learn") {
    return {
      ...buildLearnSnapshot({ userContext, pageContext }),
      restrictionMessage: MATH_ONLY_MESSAGE,
    };
  }

  if (subjectDeepDive?.active && subjectDeepDive.analysis) {
    return {
      ...buildDeepDiveSnapshot({
        userContext,
        behaviourSignals,
        subjectDeepDive,
      }),
      restrictionMessage: MATH_ONLY_MESSAGE,
    };
  }

  if (pbotState === "subject_selected") {
    return {
      ...buildSubjectSnapshot({ userContext, sessionContext }),
      restrictionMessage: MATH_ONLY_MESSAGE,
    };
  }

  return {
    ...buildHomeSnapshot({ userContext, sessionContext }),
    restrictionMessage: MATH_ONLY_MESSAGE,
  };
}
