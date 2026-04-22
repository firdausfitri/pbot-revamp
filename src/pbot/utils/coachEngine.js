import {
  buildPracticeRoute,
  buildSubjectAnalysisRoute,
  rankFocusTopics,
} from "./subjectAnalysis";

const MATH_ONLY_MESSAGE =
  "PBot prototype sekarang support Mathematics sahaja. Sila pilih Mathematics untuk teruskan.";

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
    return "Teruskan belajar dengan satu topik fokus hari ini.";
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
    return `Bagus dalam ${analysis.subjectName}. Jom mula ${firstFocus.topicName} dengan 2 quiz ringkas.`;
  }

  const hots = analysis.thinkingSkills.hots;
  if ((hots !== null && hots <= 30) || (behaviourSignals?.quitAfterWrongRate ?? 0) > 25) {
    return "HOTS masih rendah. Cuba latihan dengan hint untuk bina keyakinan.";
  }

  if (goalRemaining > 0 && firstFocus) {
    return `Fokus ${firstFocus.topicName} dulu. Lagi ${goalRemaining} quiz untuk capai target hari ini.`;
  }

  return "Prestasi stabil. Cuba satu topik lebih mencabar.";
}

function buildHomeSnapshot({ userContext, sessionContext }) {
  const hasLastActivity = Boolean(sessionContext.lastActivity);

  return {
    statusLine: `${getGoalLine(userContext)} • Last: ${getLastActivityTitle(sessionContext)}`,
    message:
      "Nak mula belajar? Pilih Mathematics atau sambung aktiviti terakhir.",
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
    message: "Ok, kita fokus Mathematics. Pilih satu topik untuk mula.",
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
        ? "Ini soalan terakhir. Semak soalan sebelumnya atau Submit Answer bila anda bersedia."
        : `Anda sedang review soalan ${questionNumber}/${quizContext.total}. Jawapan tidak boleh diubah.`,
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
          ? "Soalan terakhir. Pilih jawapan dulu, kemudian kita semak sebelum submit."
          : "Pilih jawapan dulu. Kalau ragu, tekan Hint.",
      quickActions: [
        {
          id: "hint-before-select",
          label: "Hint",
          intent: "hint",
        },
        {
          id: "eliminate-two",
          label: "Eliminate 2 pilihan",
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
          ? `Ini soalan terakhir. Pilihan ${quizContext.selectedOption}. Tekan Save Answer untuk semak sebelum submit.`
          : `Ok, anda pilih ${quizContext.selectedOption}. Nak saya semak cepat sebelum Save?`,
      quickActions: [
        {
          id: "semak-dulu",
          label: "Semak dulu",
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
      message: "Nice ✅. Jom teruskan soalan seterusnya.",
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
    message: "Jawapan salah direkod. Tengok hint atau explanation, kemudian teruskan.",
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
      message: `Anda berada di Quick Notes ${subject}. Mula chapter pertama dulu, kemudian teruskan quiz ringkas.`,
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
      message: `Pilih satu video pendek untuk ${subject}, lepas tu kita cuba 2 soalan latihan.`,
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
      message: `Bagus untuk faham konsep. Pilih satu eksperimen ${subject}, kemudian semak kefahaman dengan quiz.`,
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
      message: "Guna textbook untuk rujukan konsep susah, kemudian buat latihan pendek untuk kekalkan momentum.",
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
      message: "Kalau belum ada bookmark, teruskan practice dulu. Lepas submit jawapan, anda boleh simpan soalan penting.",
      quickActions: [
        { id: "learn-bookmark-practice", label: "Go Practice", intent: "go_practice" },
        { id: "learn-bookmark-notes", label: "Open Quick Notes", intent: "open_quick_notes" },
        { id: "learn-bookmark-hub", label: "Open Learning Hub", intent: "open_learning_hub" },
      ],
    };
  }

  return {
    statusLine,
    message: `Anda berada di Learning Hub. Pilih subjek dulu, kemudian saya boleh cadang notes, videos, atau quiz.`,
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
