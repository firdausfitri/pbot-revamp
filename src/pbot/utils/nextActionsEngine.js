import { formatQuizCount, getWeakestTopic } from "./learnerSignals";
import {
  buildPracticeRoute,
  buildSubjectAnalysisRoute,
  rankFocusTopics,
} from "./subjectAnalysis";
import { buildLearnLinks } from "./learnLinks";

function createAction(payload) {
  return payload;
}

function getGoalRemaining(userContext) {
  return Math.max(0, (userContext.dailyGoal || 0) - (userContext.goalProgress || 0));
}

function buildLearnActions({ pageContext, learnLinks }) {
  const view = pageContext.learnView || "hub";
  const subject = pageContext.selectedSubject || "Mathematics";

  if (view === "quickNotes") {
    return [
      createAction({
        id: "learn-next-notes-video",
        priority: 1,
        title: "Open Videos",
        subtitle: `Continue learning ${subject} with a video.`,
        duration: "2-3 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.videos,
        reason: "Learn page follow-up",
        intent: "open_videos",
      }),
      createAction({
        id: "learn-next-notes-quiz",
        priority: 2,
        title: "Start Quick 2-Quiz",
        subtitle: "Check your understanding after reading notes.",
        duration: "2-4 min",
        primaryLabel: "Start",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Learn page follow-up",
        intent: "start_quick_two",
      }),
      createAction({
        id: "learn-next-notes-book",
        priority: 3,
        title: "Open Textbooks",
        subtitle: "Full reference if you need more detail.",
        duration: "2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.textbooks,
        reason: "Learn page follow-up",
        intent: "open_textbook",
      }),
    ];
  }

  if (view === "videos") {
    return [
      createAction({
        id: "learn-next-videos-notes",
        priority: 1,
        title: "Open Quick Notes",
        subtitle: "Review the key points before the quiz.",
        duration: "2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.quickNotes,
        reason: "Learn page follow-up",
        intent: "open_quick_notes",
      }),
      createAction({
        id: "learn-next-videos-quiz",
        priority: 2,
        title: "Start Quick 2-Quiz",
        subtitle: "Try 2 questions right after the video.",
        duration: "2-4 min",
        primaryLabel: "Start",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Learn page follow-up",
        intent: "start_quick_two",
      }),
      createAction({
        id: "learn-next-videos-bookmark",
        priority: 3,
        title: "Open Bookmarks",
        subtitle: "Review materials you have saved.",
        duration: "1-2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.bookmarks,
        reason: "Learn page follow-up",
        intent: "open_bookmarks",
      }),
    ];
  }

  if (view === "experiments") {
    return [
      createAction({
        id: "learn-next-exp-video",
        priority: 1,
        title: "Open Videos",
        subtitle: "Watch a short demonstration related to this topic.",
        duration: "2-3 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.videos,
        reason: "Learn page follow-up",
        intent: "open_videos",
      }),
      createAction({
        id: "learn-next-exp-quiz",
        priority: 2,
        title: "Start Quick 2-Quiz",
        subtitle: "Check your understanding after the experiment.",
        duration: "2-4 min",
        primaryLabel: "Start",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Learn page follow-up",
        intent: "start_quick_two",
      }),
      createAction({
        id: "learn-next-exp-notes",
        priority: 3,
        title: "Open Quick Notes",
        subtitle: "Review the key concepts briefly.",
        duration: "2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.quickNotes,
        reason: "Learn page follow-up",
        intent: "open_quick_notes",
      }),
    ];
  }

  if (view === "textbooks") {
    return [
      createAction({
        id: "learn-next-book-notes",
        priority: 1,
        title: "Open Quick Notes",
        subtitle: "Summarize the textbook into key points.",
        duration: "2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.quickNotes,
        reason: "Learn page follow-up",
        intent: "open_quick_notes",
      }),
      createAction({
        id: "learn-next-book-video",
        priority: 2,
        title: "Open Videos",
        subtitle: "Watch a visual explanation for difficult topics.",
        duration: "2-3 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.videos,
        reason: "Learn page follow-up",
        intent: "open_videos",
      }),
      createAction({
        id: "learn-next-book-quiz",
        priority: 3,
        title: "Start Quick 2-Quiz",
        subtitle: "Test your understanding right after using the textbook.",
        duration: "2-4 min",
        primaryLabel: "Start",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Learn page follow-up",
        intent: "start_quick_two",
      }),
    ];
  }

  if (view === "bookmarks") {
    return [
      createAction({
        id: "learn-next-bookmarks-hub",
        priority: 1,
        title: "Open Learning Hub",
        subtitle: "Find new materials to save.",
        duration: "1-2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.learningHub,
        reason: "Learn page follow-up",
        intent: "open_learning_hub",
      }),
      createAction({
        id: "learn-next-bookmarks-practice",
        priority: 2,
        title: "Go Practice",
        subtitle: "Start practice so you can add bookmarks.",
        duration: "2-4 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: "/practice",
        reason: "Learn page follow-up",
        intent: "go_practice",
      }),
      createAction({
        id: "learn-next-bookmarks-notes",
        priority: 3,
        title: "Open Quick Notes",
        subtitle: "Continue with a short review.",
        duration: "2 min",
        primaryLabel: "Open",
        secondaryLabel: "",
        target: learnLinks.quickNotes,
        reason: "Learn page follow-up",
        intent: "open_quick_notes",
      }),
    ];
  }

  return [
    createAction({
      id: "learn-next-hub-notes",
      priority: 1,
      title: "Open Quick Notes",
      subtitle: `Start with short materials for ${subject}.`,
      duration: "2 min",
      primaryLabel: "Open",
      secondaryLabel: "",
      target: learnLinks.quickNotes,
      reason: "Learn page follow-up",
      intent: "open_quick_notes",
    }),
    createAction({
      id: "learn-next-hub-videos",
      priority: 2,
      title: "Open Videos",
      subtitle: "Watch a short visual explanation.",
      duration: "2-3 min",
      primaryLabel: "Open",
      secondaryLabel: "",
      target: learnLinks.videos,
      reason: "Learn page follow-up",
      intent: "open_videos",
    }),
    createAction({
      id: "learn-next-hub-book",
      priority: 3,
      title: "Open Textbooks",
      subtitle: "Complete reference if you need more detail.",
      duration: "2 min",
      primaryLabel: "Open",
      secondaryLabel: "",
      target: learnLinks.textbooks,
      reason: "Learn page follow-up",
      intent: "open_textbook",
    }),
  ];
}

function buildDeepDiveActions(subjectDeepDive, userContext) {
  const analysis = subjectDeepDive.analysis;
  const focusTopics = rankFocusTopics(analysis, 3);
  const actions = [];

  actions.push(
    createAction({
      id: "deep-improve-subject",
      priority: 1,
      title: `Improve ${analysis.subjectName}`,
      subtitle: "View full progress for this subject.",
      duration: "2 min",
      primaryLabel: "Open",
      secondaryLabel: "",
      target: buildSubjectAnalysisRoute(analysis.level, analysis.subjectKey),
      reason: "Deep dive active",
      intent: "open_link",
    }),
  );

  focusTopics.slice(0, 2).forEach((topic, index) => {
    actions.push(
      createAction({
        id: `deep-focus-${topic.chapter}`,
        priority: index + 2,
        title: `Start ${topic.topicName}`,
        subtitle:
          topic.scorePercent === null
            ? "Not started yet, good for a quick win."
            : `Current score ${topic.scorePercent}%.`,
        duration: "3-5 min",
        primaryLabel: "Learn",
        secondaryLabel: "Practice",
        target: topic.topicUrl,
        secondaryTarget: buildPracticeRoute(analysis.subjectKey, topic.topicName),
        reason: "Focus topic",
        intent: "open_link",
        secondaryIntent: "open_secondary_link",
      }),
    );
  });

  actions.push(
    createAction({
      id: "deep-practice-subject",
      priority: actions.length + 1,
      title: `Practice ${analysis.subjectName}`,
      subtitle: "Mixed practice based on your current level.",
      duration: "4-6 min",
      primaryLabel: "Practice",
      secondaryLabel: "",
      target: buildPracticeRoute(analysis.subjectKey, ""),
      reason: "Subject practice",
      intent: "open_link",
    }),
  );

  const goalRemaining = getGoalRemaining(userContext);
  if (goalRemaining > 0) {
    actions.push(
      createAction({
        id: "deep-goal",
        priority: actions.length + 1,
        title: "Complete Daily Goal",
        subtitle: `${formatQuizCount(goalRemaining)} more for today.`,
        duration: "4-7 min",
        primaryLabel: "Start quick 2-quiz",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Daily goal",
        intent: "start_quick_two",
      }),
    );
  }

  return actions.slice(0, 3);
}

export function buildNextActions({
  userContext,
  pageContext,
  sessionContext,
  mastery,
  contextStage,
  subjectDeepDive,
}) {
  const learnLinks = buildLearnLinks({
    subject: pageContext.selectedSubject,
    topic: pageContext.selectedTopic,
  });

  if (subjectDeepDive?.active && subjectDeepDive.analysis) {
    return buildDeepDiveActions(subjectDeepDive, userContext);
  }

  if (contextStage === "state_unsupported") {
    return [
      createAction({
        id: "next-switch-math",
        priority: 1,
        title: "Switch to Mathematics",
        subtitle: "This subject is not supported yet.",
        duration: "1 min",
        primaryLabel: "Switch",
        secondaryLabel: "",
        target: "/home",
        reason: "Math-only support",
        intent: "switch_to_mathematics",
      }),
    ];
  }

  const actions = [];
  const weakestTopic = getWeakestTopic(mastery);
  const lastMathActivity =
    sessionContext.lastActivity?.subject === "Mathematics"
      ? sessionContext.lastActivity
      : null;

  if (contextStage === "state_a_home") {
    if (lastMathActivity) {
      actions.push(
        createAction({
          id: "next-home-continue",
          priority: 1,
          title: "Continue Last Activity",
          subtitle: `Continue: ${lastMathActivity.title}`,
          duration: "3-5 min",
          primaryLabel: "Continue",
          secondaryLabel: "Go to Math",
          target: lastMathActivity.target || "/quiz",
          reason: "Home quick resume",
          intent: "continue_last_activity",
          secondaryIntent: "switch_to_mathematics",
        }),
      );
    }

    actions.push(
      createAction({
        id: "next-home-math",
        priority: 2,
        title: "Go to Mathematics",
        subtitle: "Choose Mathematics for accurate recommendations.",
        duration: "1 min",
        primaryLabel: "Go to Math",
        secondaryLabel: "",
        target: "/home",
        reason: "Home setup",
        intent: "switch_to_mathematics",
      }),
    );

    actions.push(
      createAction({
        id: "next-home-quick",
        priority: 3,
        title: "Start Quick 2-Quiz",
        subtitle: "Ready once Mathematics is selected.",
        duration: "2-4 min",
        primaryLabel: "Start",
        secondaryLabel: "",
        target: "/quiz",
        reason: "Behaviour: short session",
        intent: "start_quick_two",
        disabled: true,
      }),
    );

    return actions.slice(0, 3);
  }

  if (contextStage === "state_learn") {
    return buildLearnActions({ pageContext, learnLinks }).slice(0, 3);
  }

  if (contextStage === "state_b_subject") {
    actions.push(
      createAction({
        id: "next-b-choose-topic",
        priority: 1,
        title: "Choose a Topic",
        subtitle: "Choose a topic for more accurate coaching.",
        duration: "1 min",
        primaryLabel: "Choose Topic",
        secondaryLabel: "",
        target: "/learn",
        reason: "Subject selected, topic pending",
        intent: "choose_topic",
      }),
    );

    actions.push(
      createAction({
        id: "next-b-learning-hub",
        priority: 2,
        title: "Open Learning Hub",
        subtitle: "View notes, videos, and practice materials.",
        duration: "2 min",
        primaryLabel: "Open Hub",
        secondaryLabel: "",
        target: learnLinks.learningHub,
        reason: "Learning resources",
        intent: "open_learning_hub",
      }),
    );

    if (lastMathActivity) {
      actions.push(
        createAction({
          id: "next-b-continue",
          priority: 3,
          title: "Continue Last Quiz (Math)",
          subtitle: `Sambung: ${lastMathActivity.title}`,
          duration: "3-5 min",
          primaryLabel: "Continue",
          secondaryLabel: "",
          target: lastMathActivity.target || "/quiz",
          reason: "Resume progress",
          intent: "continue_last_activity",
        }),
      );
    }

    return actions.slice(0, 3);
  }

  if (weakestTopic) {
    actions.push(
      createAction({
        id: "next-c-weak",
        priority: 1,
        title: `Practice Weak Topic: ${weakestTopic.topic}`,
        subtitle: `Mastery semasa ${weakestTopic.mastery}%.`,
        duration: "4-6 min",
        primaryLabel: "Practice",
        secondaryLabel: "Set Topic",
        target: "/practice",
        reason: "Priority: weak topic practice",
        intent: "set_topic",
        secondaryIntent: "set_topic",
        topic: weakestTopic.topic,
      }),
    );
  }

  if (lastMathActivity) {
    actions.push(
      createAction({
        id: "next-c-continue",
        priority: 2,
        title: "Continue Last Quiz",
        subtitle: `Sambung: ${lastMathActivity.title}`,
        duration: "3-5 min",
        primaryLabel: "Continue",
        secondaryLabel: "",
        target: lastMathActivity.target || "/quiz",
        reason: "Priority: continue last quiz",
        intent: "continue_last_activity",
      }),
    );
  }

  actions.push(
    createAction({
      id: "next-c-notes",
      priority: 3,
      title: "Quick Notes",
      subtitle: "Ulang kaji konsep utama dengan cepat.",
      duration: "2-3 min",
      primaryLabel: "Open Notes",
      secondaryLabel: "",
      target: learnLinks.quickNotes,
      reason: "Learning resources",
      intent: "open_quick_notes",
    }),
  );

  return actions.slice(0, 3);
}
