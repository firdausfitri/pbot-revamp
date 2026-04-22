import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./pbot.css";

import FloatingButton from "./components/FloatingButton";
import Drawer from "./components/Drawer";
import Tabs from "./components/Tabs";
import CoachTab from "./components/CoachTab";
import InsightsTab from "./components/InsightsTab";
import NextActionsTab from "./components/NextActionsTab";

import { mockMastery } from "./data/mockMastery";
import { mockBehaviour } from "./data/mockBehaviour";
import { buildCoachSnapshot } from "./utils/coachEngine";
import { buildLearningInsights } from "./utils/insightsEngine";
import { buildNextActions } from "./utils/nextActionsEngine";
import { fetchSubjectAnalysis, rankFocusTopics } from "./utils/subjectAnalysis";
import { detectCoachTextIntent, generateCoachReply } from "./utils/coachChatEngine";
import { buildLearnLinks } from "./utils/learnLinks";
import { usePBotContext } from "./context/PBotContext";

const TAB = {
  COACH: "coach",
  INSIGHTS: "insights",
  NEXT: "next",
};

const MALAY_ORDINALS = ["pertama", "kedua", "ketiga", "keempat", "kelima"];

function getMalayOrdinalQuestionLabel(questionNumber, total) {
  if (questionNumber >= total) {
    return "soalan terakhir";
  }

  const ordinal = MALAY_ORDINALS[questionNumber - 1];
  return ordinal ? `soalan ${ordinal}` : `soalan ke-${questionNumber}`;
}

export default function PBotWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB.COACH);
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachThinking, setCoachThinking] = useState(false);
  const [nudge, setNudge] = useState(null);
  const [attentionPulse, setAttentionPulse] = useState(false);
  const nudgeTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const prevInProgressRef = useRef(false);
  const wrongNudgedForQuestionRef = useRef(null);
  const finalReviewNudgedForQuestionRef = useRef(null);
  const deepDiveRequestRef = useRef(0);
  const nudgeMetaRef = useRef({
    lastShownAt: 0,
    questionNudged: null,
    dismissCount: 0,
    muteUntil: 0,
    introShown: false,
  });
  const [deepDiveState, setDeepDiveState] = useState({
    view: "default",
    status: "idle",
    request: null,
    analysis: null,
    error: null,
  });
  const {
    userContext,
    pageContext,
    sessionContext,
    quizContext,
    pbotState,
    contextStage,
    actions,
  } = usePBotContext();

  const subjectDeepDive = useMemo(
    () => ({
      active:
        deepDiveState.view === "subjectDeepDive" &&
        deepDiveState.status === "success" &&
        Boolean(deepDiveState.analysis),
      analysis: deepDiveState.analysis,
    }),
    [deepDiveState.view, deepDiveState.status, deepDiveState.analysis],
  );

  const deepDiveFocusTopics = useMemo(() => {
    if (!deepDiveState.analysis) {
      return [];
    }
    return rankFocusTopics(deepDiveState.analysis, 3);
  }, [deepDiveState.analysis]);

  const coachSnapshot = useMemo(() => {
    return buildCoachSnapshot({
      userContext,
      pageContext,
      sessionContext,
      quizContext,
      pbotState,
      behaviourSignals: mockBehaviour,
      subjectDeepDive,
    });
  }, [
    userContext,
    pageContext,
    sessionContext,
    quizContext,
    pbotState,
    subjectDeepDive,
  ]);

  const insights = useMemo(() => {
    return buildLearningInsights({
      mastery: mockMastery,
      behaviour: mockBehaviour,
      contextStage,
    });
  }, [contextStage]);

  const recommendations = useMemo(() => {
    return buildNextActions({
      userContext,
      pageContext,
      sessionContext,
      mastery: mockMastery,
      behaviour: mockBehaviour,
      contextStage,
      subjectDeepDive,
    });
  }, [userContext, pageContext, sessionContext, contextStage, subjectDeepDive]);

  const learnLinks = useMemo(
    () =>
      buildLearnLinks({
        subject: pageContext.selectedSubject,
        topic: pageContext.selectedTopic,
      }),
    [pageContext.selectedSubject, pageContext.selectedTopic],
  );

  const clearNudgeTimers = useCallback(() => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
  }, []);

  const dismissNudge = useCallback(
    ({ countDismiss = true } = {}) => {
      clearNudgeTimers();
      setNudge(null);
      if (!countDismiss) {
        return;
      }

      const meta = nudgeMetaRef.current;
      meta.dismissCount += 1;
      if (meta.dismissCount >= 2) {
        meta.muteUntil = Date.now() + 10 * 60 * 1000;
        meta.dismissCount = 0;
      }
    },
    [clearNudgeTimers],
  );

  const triggerAttentionPulse = useCallback(() => {
    setAttentionPulse(true);
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = setTimeout(() => {
      setAttentionPulse(false);
      pulseTimerRef.current = null;
    }, 1200);
  }, []);

  const canShowNudge = useCallback(
    ({ questionScoped = true, respectCooldown = true } = {}) => {
      if (open) {
        return false;
      }

      const now = Date.now();
      const meta = nudgeMetaRef.current;

      if (now < meta.muteUntil) {
        return false;
      }
      if (respectCooldown && now - meta.lastShownAt < 45_000) {
        return false;
      }
      if (
        questionScoped &&
        quizContext.inProgress &&
        meta.questionNudged === quizContext.currentIndex
      ) {
        return false;
      }

      return true;
    },
    [open, quizContext.currentIndex, quizContext.inProgress],
  );

  const showNudge = useCallback(
    (message, { questionScoped = true, respectCooldown = true } = {}) => {
      if (!canShowNudge({ questionScoped, respectCooldown })) {
        return false;
      }

      const meta = nudgeMetaRef.current;
      meta.lastShownAt = Date.now();
      if (questionScoped && quizContext.inProgress) {
        meta.questionNudged = quizContext.currentIndex;
      }

      clearNudgeTimers();
      setNudge({ message });
      triggerAttentionPulse();
      nudgeTimerRef.current = setTimeout(() => {
        dismissNudge({ countDismiss: false });
      }, 5000);
      return true;
    },
    [
      canShowNudge,
      clearNudgeTimers,
      dismissNudge,
      quizContext.currentIndex,
      quizContext.inProgress,
      triggerAttentionPulse,
    ],
  );

  useEffect(() => {
    function handleExternalOpen() {
      dismissNudge({ countDismiss: false });
      setOpen(true);
      setActiveTab(TAB.COACH);
    }

    window.addEventListener("pbot:open", handleExternalOpen);
    return () => window.removeEventListener("pbot:open", handleExternalOpen);
  }, [dismissNudge]);

  useEffect(() => {
    return () => {
      clearNudgeTimers();
    };
  }, [clearNudgeTimers]);

  useEffect(() => {
    if (!quizContext.inProgress) {
      prevInProgressRef.current = false;
      wrongNudgedForQuestionRef.current = null;
      finalReviewNudgedForQuestionRef.current = null;
      nudgeMetaRef.current.questionNudged = null;
      return undefined;
    }

    prevInProgressRef.current = true;
    return undefined;
  }, [quizContext.inProgress]);

  useEffect(() => {
    if (
      !(
        quizContext.inProgress &&
        !quizContext.isReviewingFinalSet &&
        quizContext.subState === "awaiting_selection"
      )
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const questionNumber = quizContext.currentIndex + 1;
      const questionLabel = getMalayOrdinalQuestionLabel(
        questionNumber,
        quizContext.total,
      );
      const message =
        questionNumber === quizContext.total
          ? "Ini soalan terakhir."
          : `Ini ${questionLabel}.`;
      showNudge(message, { respectCooldown: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [
    quizContext.currentIndex,
    quizContext.inProgress,
    quizContext.isReviewingFinalSet,
    quizContext.subState,
    quizContext.total,
    showNudge,
  ]);

  useEffect(() => {
    if (
      !(
        quizContext.inProgress &&
        !quizContext.isReviewingFinalSet &&
        quizContext.subState === "awaiting_selection"
      )
    ) {
      return undefined;
    }

    const idleTimer = setTimeout(() => {
      showNudge("Perlu hint? Saya boleh guide langkah pertama.");
    }, 9000);

    return () => clearTimeout(idleTimer);
  }, [
    quizContext.currentIndex,
    quizContext.inProgress,
    quizContext.isReviewingFinalSet,
    quizContext.subState,
    showNudge,
  ]);

  useEffect(() => {
    if (
      !(
        quizContext.inProgress &&
        !quizContext.isReviewingFinalSet &&
        quizContext.saved &&
        quizContext.isCorrect === false
      )
    ) {
      return undefined;
    }

    if (wrongNudgedForQuestionRef.current === quizContext.currentIndex) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const shown = showNudge(
        "Jawapan salah direkod. Semak explanation, kemudian tekan Next.",
        { questionScoped: false, respectCooldown: false },
      );
      if (shown) {
        wrongNudgedForQuestionRef.current = quizContext.currentIndex;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    quizContext.inProgress,
    quizContext.isReviewingFinalSet,
    quizContext.saved,
    quizContext.isCorrect,
    quizContext.currentIndex,
    showNudge,
  ]);

  useEffect(() => {
    if (
      !(
        quizContext.inProgress &&
        quizContext.isReviewingFinalSet &&
        quizContext.displayIndex === quizContext.total - 1
      )
    ) {
      return undefined;
    }

    if (finalReviewNudgedForQuestionRef.current === quizContext.currentIndex) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const shown = showNudge(
        "Soalan terakhir siap disemak. Anda boleh review soalan sebelumnya atau Submit Answer bila ready.",
        { questionScoped: false, respectCooldown: false },
      );
      if (shown) {
        finalReviewNudgedForQuestionRef.current = quizContext.currentIndex;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    quizContext.currentIndex,
    quizContext.displayIndex,
    quizContext.inProgress,
    quizContext.isReviewingFinalSet,
    quizContext.total,
    showNudge,
  ]);

  const openLink = useCallback((url) => {
    if (!url || url === "#" || typeof url !== "string") {
      return;
    }
    window.location.assign(url);
  }, []);

  const openLearnView = useCallback(
    (resource, fallbackView = "hub") => {
      const descriptor =
        resource && typeof resource === "object" ? resource : { view: fallbackView };

      actions.openLearnView(descriptor.view || fallbackView, {
        ...(Object.prototype.hasOwnProperty.call(descriptor, "subject")
          ? { subject: descriptor.subject }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(descriptor, "topic")
          ? { topic: descriptor.topic }
          : {}),
      });
      setOpen(false);
    },
    [actions],
  );

  const loadSubjectDeepDive = useCallback(async (request) => {
    const nextRequestId = deepDiveRequestRef.current + 1;
    deepDiveRequestRef.current = nextRequestId;

    setDeepDiveState((prev) => ({
      view: "subjectDeepDive",
      status: "loading",
      request,
      analysis:
        prev.analysis &&
        prev.request?.level === request.level &&
        prev.request?.subjectKey === request.subjectKey
          ? prev.analysis
          : null,
      error: null,
    }));

    try {
      const analysis = await fetchSubjectAnalysis(request.level, request.subjectKey, {
        subjectName: request.subjectName,
      });
      if (deepDiveRequestRef.current !== nextRequestId) {
        return;
      }
      setDeepDiveState({
        view: "subjectDeepDive",
        status: "success",
        request,
        analysis,
        error: null,
      });
    } catch (error) {
      if (deepDiveRequestRef.current !== nextRequestId) {
        return;
      }
      setDeepDiveState({
        view: "subjectDeepDive",
        status: "error",
        request,
        analysis: null,
        error: error instanceof Error ? error.message : "Failed to load subject analysis.",
      });
    }
  }, []);

  function handleInsightsViewMore(request) {
    loadSubjectDeepDive(request);
  }

  function handleDeepDiveBack() {
    setDeepDiveState((prev) => ({
      ...prev,
      view: "default",
      status: prev.analysis ? "success" : "idle",
    }));
  }

  function handleDeepDiveRetry() {
    if (!deepDiveState.request) {
      return;
    }
    loadSubjectDeepDive(deepDiveState.request);
  }

  function runIntent(intent, payload = {}) {
    switch (intent) {
      case "open_learn_view": {
        openLearnView(payload, payload.view || "hub");
        return;
      }
      case "open_link": {
        openLink(payload.target);
        return;
      }
      case "open_secondary_link": {
        openLink(payload.secondaryTarget || payload.target);
        return;
      }
      case "go_to_mathematics": {
        actions.setSelectedSubject("Mathematics");
        actions.clearTopic();
        actions.setRoute("quiz");
        actions.stopQuiz();
        actions.requestTopicPickerFocus();
        return;
      }
      case "switch_to_mathematics": {
        actions.setSelectedSubject("Mathematics");
        actions.clearTopic();
        actions.setRoute("quiz");
        actions.stopQuiz();
        actions.requestTopicPickerFocus();
        return;
      }
      case "continue_last_activity": {
        const activity = sessionContext.lastActivity;
        if (!activity) {
          return;
        }
        if (activity.subject === "Mathematics") {
          actions.startQuiz({ topic: activity.topic, total: 5 });
          return;
        }
        actions.setRoute(activity.route || "quiz");
        actions.setSelectedSubject(activity.subject || "Mathematics");
        actions.stopQuiz();
        return;
      }
      case "start_quick_two": {
        if (
          pageContext.selectedSubject === "Mathematics" &&
          pageContext.selectedTopic
        ) {
          actions.startQuiz({ topic: pageContext.selectedTopic, total: 2 });
          return;
        }

        actions.setSelectedSubject("Mathematics");
        actions.clearTopic();
        actions.setRoute("quiz");
        actions.stopQuiz();
        actions.requestTopicPickerFocus();
        return;
      }
      case "set_topic": {
        actions.setSelectedSubject("Mathematics");
        if (payload.topic) {
          actions.setSelectedTopic(payload.topic);
        }
        actions.setRoute("quiz");
        actions.stopQuiz();
        return;
      }
      case "choose_topic": {
        actions.setSelectedSubject("Mathematics");
        actions.setRoute("quiz");
        actions.stopQuiz();
        actions.requestTopicPickerFocus();
        setOpen(false);
        return;
      }
      case "back_home": {
        actions.setRoute("home");
        actions.setSelectedSubject(null);
        actions.clearTopic();
        actions.stopQuiz();
        return;
      }
      case "go_practice": {
        actions.setRoute("practice");
        actions.stopQuiz();
        return;
      }
      case "open_learning_hub": {
        openLearnView(payload.target || learnLinks.learningHub, "hub");
        return;
      }
      case "open_quick_notes": {
        openLearnView(payload.target || learnLinks.quickNotes, "quickNotes");
        return;
      }
      case "open_videos": {
        openLearnView(payload.target || learnLinks.videos, "videos");
        return;
      }
      case "open_experiments": {
        openLearnView(payload.target || learnLinks.experiments, "experiments");
        return;
      }
      case "open_textbook": {
        openLearnView(payload.target || learnLinks.textbooks, "textbooks");
        return;
      }
      case "open_bookmarks": {
        openLearnView(payload.target || learnLinks.bookmarks, "bookmarks");
        return;
      }
      case "hint": {
        actions.toggleQuizHint();
        return;
      }
      case "eliminate_two": {
        actions.eliminateTwoChoices();
        return;
      }
      case "review_before_save": {
        actions.showQuizHint();
        return;
      }
      case "save_answer": {
        actions.saveQuizAnswer();
        return;
      }
      case "previous_review_question": {
        actions.previousReviewQuestion();
        return;
      }
      case "next_question": {
        actions.nextQuizQuestion();
        return;
      }
      case "submit_quiz_set": {
        actions.submitQuizSet();
        return;
      }
      case "harder": {
        actions.nextQuizQuestion();
        actions.clearQuizElimination();
        actions.hideQuizHint();
        return;
      }
      case "show_hint": {
        actions.showQuizHint();
        return;
      }
      case "try_again": {
        actions.showQuizHint();
        return;
      }
      case "see_solution": {
        actions.showQuizHint();
        return;
      }
      case "review_mistakes": {
        openLink("/dashboard/history");
        return;
      }
      case "set_reminder": {
        window.alert("Prototype: reminder setup will be connected later.");
        return;
      }
      default: {
        return;
      }
    }
  }

  function sendCoachMessage(input) {
    const trimmed = input.trim();
    if (!trimmed || coachThinking) {
      return;
    }

    setCoachMessages((prev) => {
      const next = [
        ...prev,
        {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: "user",
          text: trimmed,
        },
      ];
      return next.slice(-14);
    });

    const intent = detectCoachTextIntent(trimmed);
    if (intent) {
      runIntent(intent, { topic: pageContext.selectedTopic });
    }

    setCoachThinking(true);
    setTimeout(() => {
      const reply = generateCoachReply({
        input: trimmed,
        pbotState,
        pageContext,
        quizContext,
        sessionContext,
      });

      setCoachMessages((prev) => {
        const next = [
          ...prev,
          {
            id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            role: "bot",
            text: reply,
          },
        ];
        return next.slice(-14);
      });
      setCoachThinking(false);
    }, 320);
  }

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        dismissNudge({ countDismiss: false });
      }
      return next;
    });
  }

  function openCoachFromNudge() {
    clearNudgeTimers();
    setNudge(null);
    nudgeMetaRef.current.dismissCount = 0;
    setOpen(true);
    setActiveTab(TAB.COACH);
  }

  const learnerProfile = {
    name: userContext.name,
    level: userContext.level,
    language: userContext.language,
    goal: `${userContext.goalProgress}/${userContext.dailyGoal} quizzes today`,
  };

  const displayContext = {
    level: userContext.level,
    subject: pageContext.selectedSubject || "No subject selected",
    topic: pageContext.selectedTopic || "No topic selected",
    mode: pageContext.mode,
    route: pageContext.route,
  };

  const segment = { label: userContext.segment };

  return (
    <>
      <FloatingButton
        open={open}
        onClick={toggleOpen}
        attentionPulse={attentionPulse}
        nudge={nudge}
        onNudgeOpenCoach={openCoachFromNudge}
        onNudgeDismiss={() => dismissNudge({ countDismiss: true })}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="PBot Coach"
      >
        <Tabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: TAB.COACH, label: "Coach", icon: "💬" },
            { id: TAB.INSIGHTS, label: "Insights", icon: "✨" },
            { id: TAB.NEXT, label: "Actions", icon: "🎯" },
          ]}
        />

        {activeTab === TAB.COACH && (
          <CoachTab
            userContext={userContext}
            pageContext={pageContext}
            pbotState={pbotState}
            coachSnapshot={coachSnapshot}
            messages={coachMessages}
            isThinking={coachThinking}
            onSendMessage={sendCoachMessage}
            onQuickAction={(action) =>
              !action.disabled && runIntent(action.intent, action)
            }
          />
        )}

        {activeTab === TAB.INSIGHTS && (
          <InsightsTab
            profile={learnerProfile}
            mastery={mockMastery}
            behaviour={mockBehaviour}
            segment={segment}
            insights={insights}
            deepDiveState={deepDiveState}
            focusTopics={deepDiveFocusTopics}
            onViewMore={handleInsightsViewMore}
            onDeepDiveBack={handleDeepDiveBack}
            onDeepDiveRetry={handleDeepDiveRetry}
            onOpenLink={openLink}
          />
        )}

        {activeTab === TAB.NEXT && (
          <NextActionsTab
            recommendations={recommendations}
            context={displayContext}
            segment={segment}
            onAction={(action, isSecondary) => {
              const intent = isSecondary ? action.secondaryIntent : action.intent;
              if (!intent || action.disabled) {
                return;
              }
              runIntent(intent, action);
            }}
          />
        )}
      </Drawer>
    </>
  );
}
