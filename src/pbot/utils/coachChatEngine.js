const MATH_ONLY_MESSAGE =
  "This PBot prototype currently supports Mathematics only. Please choose Mathematics to continue.";

const MATH_TOPICS = [
  "Functions",
  "Number Value",
  "Quadratic Equation",
  "Simultaneous Equations",
  "Graph Interpretation",
];

export function detectCoachTextIntent(input) {
  const text = (input || "").toLowerCase();

  if (/learning hub|hub pembelajaran|learn hub/.test(text)) {
    return "open_learning_hub";
  }
  if (/quick notes|nota ringkas|nota cepat|nota/.test(text)) {
    return "open_quick_notes";
  }
  if (/video|videos/.test(text)) {
    return "open_videos";
  }
  if (/experiment|experiments|eksperimen/.test(text)) {
    return "open_experiments";
  }
  if (/textbook|text book|buku teks|buku/.test(text)) {
    return "open_textbook";
  }
  if (/bookmark|bookmarks|simpan bahan/.test(text)) {
    return "open_bookmarks";
  }
  if (/practice|latihan/.test(text)) {
    return "go_practice";
  }
  if (/hint|petunjuk|clue/.test(text)) {
    return "hint";
  }
  if (/save answer|save|simpan jawapan|simpan/.test(text)) {
    return "save_answer";
  }
  if (/submit answer|submit|hantar jawapan|hantar/.test(text)) {
    return "submit_quiz_set";
  }
  if (/previous|sebelumnya|undur|soalan sebelum/.test(text)) {
    return "previous_review_question";
  }
  if (/next|seterusnya|soalan seterusnya/.test(text)) {
    return "next_question";
  }
  if (/mula quiz|start quiz|quick quiz|kuiz cepat/.test(text)) {
    return "start_quick_two";
  }

  return null;
}

function buildHomeReply(text, sessionContext) {
  if (/nota|video|buku|hub|bookmark/.test(text)) {
    return "Sure. Choose Mathematics first, then I can open the right learning materials.";
  }

  if (/sambung|continue|last/.test(text) && sessionContext.lastActivity?.title) {
    return `Sure. Let's continue "${sessionContext.lastActivity.title}" first.`;
  }

  if (/mathematics|math|matematik/.test(text)) {
    return "Good. Choose Mathematics first, then we can pick the best topic.";
  }

  return "I suggest choosing Mathematics first, then starting with an easier topic.";
}

function buildSubjectReply(text) {
  if (/nota/.test(text)) {
    return "I can open Quick Notes for your selected topic.";
  }

  if (/video/.test(text)) {
    return "I can open a short video for your topic.";
  }

  if (/buku|textbook/.test(text)) {
    return "Sure, I can take you to the textbook reference.";
  }

  if (/senang|mudah|easy/.test(text)) {
    return "Start with Number Value first. Once you feel confident, move to Functions.";
  }

  if (/topik|topic|chapter/.test(text)) {
    return `Suggested topics: ${MATH_TOPICS.slice(0, 3).join(", ")}. Which one do you want to start with?`;
  }

  return "Mathematics is selected. Choose one topic first so I can coach you more accurately.";
}

function buildQuizReply(text, quizContext) {
  if (/nota/.test(text)) {
    return "Sure, I will open Quick Notes for this topic.";
  }

  if (/video/.test(text)) {
    return "Sure, I will open a short video to help explain the concept.";
  }

  if (/buku|textbook/.test(text)) {
    return "Sure, I will open the textbook reference for this topic.";
  }

  if (quizContext.subState === "reviewing_final") {
    const questionNumber = (quizContext.displayIndex ?? quizContext.currentIndex) + 1;
    if (/submit|hantar/.test(text)) {
      return "When you are done reviewing, press Submit Answer to finish this set.";
    }

    return questionNumber === quizContext.total
      ? "This is the last question in review mode. You can review previous questions or submit now."
      : `You are reviewing question ${questionNumber}/${quizContext.total}. This mode is read-only.`;
  }

  if (/hint|petunjuk/.test(text) && quizContext.currentQuestion?.hint) {
    return `Hint: ${quizContext.currentQuestion.hint}`;
  }

  if (quizContext.subState === "awaiting_selection") {
    return "Try choosing the closest answer first. If you are unsure, type 'hint'.";
  }

  if (quizContext.subState === "selected_not_saved") {
    return `Choice ${quizContext.selectedOption || "-"} is recorded. If you are sure, press Save Answer.`;
  }

  if (quizContext.subState === "saved_correct") {
    return "Good, that answer is correct. Let's continue to the next question.";
  }

  if (quizContext.subState === "saved_wrong") {
    return "Wrong answer saved. Read the explanation, then press Next for the next question.";
  }

  return "I am here. Continue one step at a time.";
}

function getLearnPageLabel(learnView) {
  const labels = {
    hub: "Learning Hub",
    quickNotes: "Quick Notes",
    videos: "Videos",
    experiments: "Experiments",
    textbooks: "Textbooks",
    bookmarks: "Bookmarks",
  };
  return labels[learnView] || "Learning Hub";
}

function buildLearnReply(text, pageContext) {
  const learnView = pageContext.learnView || "hub";
  const subject = pageContext.selectedSubject || "Mathematics";

  if (/nota/.test(text)) {
    return "Sure, I can open Quick Notes for this subject.";
  }
  if (/video/.test(text)) {
    return "Sure, I can open Videos for this subject.";
  }
  if (/eksperimen|experiment/.test(text)) {
    return "Sure, I can open Experiments for this subject.";
  }
  if (/buku|textbook/.test(text)) {
    return "Sure, I can open Textbooks for further reference.";
  }
  if (/bookmark/.test(text)) {
    return "Sure, I can open Bookmarks now.";
  }
  if (/quiz|latihan|practice/.test(text)) {
    return "After learning, continue with a quick quiz to check your understanding.";
  }

  return `You are in ${getLearnPageLabel(learnView)} for ${subject}. Should I open notes, videos, or a textbook?`;
}

export function generateCoachReply({
  input,
  pbotState,
  pageContext,
  quizContext,
  sessionContext,
}) {
  const text = (input || "").toLowerCase();

  if (pbotState === "unsupported") {
    return MATH_ONLY_MESSAGE;
  }

  if (pbotState === "home") {
    return buildHomeReply(text, sessionContext);
  }

  if (pbotState === "learn") {
    return buildLearnReply(text, pageContext);
  }

  if (pbotState === "subject_selected") {
    return buildSubjectReply(text);
  }

  if (pbotState === "quiz") {
    return buildQuizReply(text, quizContext);
  }

  if (pageContext.selectedTopic) {
    return `For ${pageContext.selectedTopic}, we can start with 2 warm-up questions first.`;
  }

  return "Sure, I can help step by step.";
}
