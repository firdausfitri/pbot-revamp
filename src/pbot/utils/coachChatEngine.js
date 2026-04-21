const MATH_ONLY_MESSAGE =
  "PBot prototype sekarang support Mathematics sahaja. Sila pilih Mathematics untuk teruskan.";

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
    return "Boleh. Pilih Mathematics dulu, lepas tu saya buka bahan belajar yang sesuai.";
  }

  if (/sambung|continue|last/.test(text) && sessionContext.lastActivity?.title) {
    return `Boleh. Kita sambung "${sessionContext.lastActivity.title}" dulu.`;
  }

  if (/mathematics|math|matematik/.test(text)) {
    return "Bagus. Pilih Mathematics dulu, lepas tu kita pilih topik paling sesuai.";
  }

  return "Saya cadang pilih Mathematics dulu, kemudian kita mula dengan topik mudah.";
}

function buildSubjectReply(text) {
  if (/nota/.test(text)) {
    return "Saya boleh buka Quick Notes untuk topik pilihan anda.";
  }

  if (/video/.test(text)) {
    return "Saya boleh buka video ringkas ikut topik anda.";
  }

  if (/buku|textbook/.test(text)) {
    return "Baik, saya boleh bawa anda ke rujukan buku teks.";
  }

  if (/senang|mudah|easy/.test(text)) {
    return "Mula dengan Number Value dulu. Lepas yakin, baru pergi Functions.";
  }

  if (/topik|topic|chapter/.test(text)) {
    return `Topik cadangan: ${MATH_TOPICS.slice(0, 3).join(", ")}. Nak mula yang mana?`;
  }

  return "Kita dah set Mathematics. Pilih satu topik dulu supaya saya boleh coach lebih tepat.";
}

function buildQuizReply(text, quizContext) {
  if (/nota/.test(text)) {
    return "Baik, saya buka Quick Notes untuk topik ini.";
  }

  if (/video/.test(text)) {
    return "Baik, saya buka video ringkas supaya senang faham konsep.";
  }

  if (/buku|textbook/.test(text)) {
    return "Baik, saya buka rujukan buku teks untuk topik ini.";
  }

  if (/hint|petunjuk/.test(text) && quizContext.currentQuestion?.hint) {
    return `Hint: ${quizContext.currentQuestion.hint}`;
  }

  if (quizContext.subState === "awaiting_selection") {
    return "Cuba pilih jawapan paling hampir dulu. Kalau ragu, taip 'hint'.";
  }

  if (quizContext.subState === "selected_not_saved") {
    return `Pilihan ${quizContext.selectedOption || "-"} direkod. Kalau yakin, tekan Save Answer.`;
  }

  if (quizContext.subState === "saved_correct") {
    return "Bagus, jawapan betul. Jom teruskan ke soalan seterusnya.";
  }

  if (quizContext.subState === "saved_wrong") {
    return "Jawapan salah direkod. Rujuk explanation, kemudian tekan Next untuk soalan seterusnya.";
  }

  return "Saya ada di sini. Teruskan satu langkah demi satu langkah.";
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
    return "Baik, saya boleh buka Quick Notes untuk subjek ini.";
  }
  if (/video/.test(text)) {
    return "Baik, saya boleh buka Videos untuk subjek ini.";
  }
  if (/eksperimen|experiment/.test(text)) {
    return "Baik, saya boleh buka Experiments untuk subjek ini.";
  }
  if (/buku|textbook/.test(text)) {
    return "Baik, saya boleh buka Textbooks untuk rujukan lanjut.";
  }
  if (/bookmark/.test(text)) {
    return "Baik, saya boleh buka Bookmarks sekarang.";
  }
  if (/quiz|latihan|practice/.test(text)) {
    return "Lepas habis belajar, kita teruskan dengan quick quiz untuk semak kefahaman.";
  }

  return `Anda di ${getLearnPageLabel(learnView)} untuk ${subject}. Nak saya buka notes, videos, atau textbook?`;
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
    return `Untuk topik ${pageContext.selectedTopic}, kita boleh buat 2 soalan warm-up dulu.`;
  }

  return "Boleh, saya bantu langkah demi langkah.";
}
