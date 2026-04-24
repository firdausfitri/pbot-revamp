import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { PBotContextProvider, usePBotContext } from "./pbot/context/PBotContext";
import pbotMascot from "./pbot/assets/pbot-mascot.svg";
import { LEARN_MENU_ITEMS } from "./learnMenuItems";
import { LearnPageView } from "./learnViews";
import {
  LANGUAGE_OPTIONS,
  LOCKED_REWARD_PREVIEWS,
  REWARD_OPTIONS,
  buildNameSuggestions,
  getLearnerDisplayName,
  getLearnerInitial,
  normalizeLearnerName,
} from "./onboarding/profileStorage";
import { MISSION_DEFINITIONS, STARTER_MISSION_ID } from "./missionData";
import "./App.css";

const TOP_MENU = [
  { id: "home", label: "Home" },
  { id: "quiz", label: "Quiz" },
  { id: "battle", label: "Battle" },
  { id: "practice", label: "Practice" },
  { id: "class", label: "Class" },
  { id: "learn", label: "Learn" },
  { id: "achievement", label: "Achievement" },
  { id: "potential", label: "Potential" },
  { id: "mission", label: "Mission" },
  { id: "rewards", label: "Rewards" },
];

const QUIZ_STAR_THRESHOLDS = [33.33, 66.67, 100];
const SECOND_GUIDED_QUESTION_INDEX = 1;
const SECOND_GUIDED_WRONG_OPTION_ID = "C";
const THIRD_GUIDED_QUESTION_INDEX = 2;
const ENGLISH_ORDINALS = ["first", "second", "third", "fourth", "fifth"];
const READ_GUIDE_LOCK_MS = 2000;

function getEnglishOrdinalQuestionLabel(questionNumber, total) {
  if (questionNumber >= total) {
    return "last question";
  }

  return `${ENGLISH_ORDINALS[questionNumber - 1] || `${questionNumber}th`} question`;
}

function capitalizeLabel(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSubmissionDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

const SUBJECT_CARDS = [
  {
    id: "mathematics-main",
    icon: "M",
    subject: "Mathematics",
    topic: "Functions",
    description: "Latihan asas nombor, fungsi & graf.",
    tagTone: "blue",
    thumbTone: "mint",
    highlight: true,
  },
  {
    id: "islam-quran",
    icon: "QI",
    subject: "Pendidikan Islam",
    topic: "Al-Quran",
    description: "Asas bacaan dan kefahaman surah pilihan.",
    tagTone: "pink",
    thumbTone: "teal",
  },
  {
    id: "akaun-prinsip",
    icon: "AC",
    subject: "Prinsip Perakaunan",
    topic: "Pengenalan kepada perakaunan",
    description: "Konsep asas debit, kredit, dan aliran rekod.",
    tagTone: "blue",
    thumbTone: "mint",
  },
  {
    id: "cs-caraatur",
    icon: "SC",
    subject: "Sains Komputer",
    topic: "Pengaturcaraan",
    description: "Pemikiran algoritma dan struktur kawalan.",
    tagTone: "slate",
    thumbTone: "lavender",
  },
  {
    id: "biz-perniagaan",
    icon: "PG",
    subject: "Perniagaan",
    topic: "Tujuan perniagaan dan pemilikan perniagaan",
    description: "Jenis organisasi dan fungsi usahawan.",
    tagTone: "orange",
    thumbTone: "sand",
  },
  {
    id: "ekonomi-intro",
    icon: "EK",
    subject: "Ekonomi",
    topic: "Pengenalan kepada Ekonomi",
    description: "Keperluan, kehendak, dan pilihan pengguna.",
    tagTone: "orange-strong",
    thumbTone: "peach",
    highlight: true,
  },
  {
    id: "moral-norma",
    icon: "PM",
    subject: "Pendidikan Moral",
    topic: "Norma Masyarakat Pemangkin Kesejahteraan",
    description: "Nilai murni dalam interaksi sosial.",
    tagTone: "lime",
    thumbTone: "green-soft",
  },
  {
    id: "arabic-lughah",
    icon: "AR",
    subject: "KBD Al-Lughah Al-Arabiah Al-Muasirah",
    topic: "Al-Mutalaah wal-Insya",
    description: "Tatabahasa dan kefasihan dalam konteks semasa.",
    tagTone: "emerald",
    thumbTone: "emerald",
  },
  {
    id: "syariah-fiqh",
    icon: "SY",
    subject: "KBD Al-Syariah",
    topic: "Fiqh al-Ibadat",
    description: "Hukum asas dan aplikasi ibadah harian.",
    tagTone: "emerald",
    thumbTone: "emerald",
  },
  {
    id: "usul-din",
    icon: "UD",
    subject: "KBD Usul al-Din",
    topic: "Al-Tawhid",
    description: "Asas akidah dan pengukuhan kefahaman.",
    tagTone: "emerald",
    thumbTone: "emerald",
  },
  {
    id: "adab-balaghah",
    icon: "AB",
    subject: "KBD Al-Adab Wa Al-Balaghah",
    topic: "Tarikh al-Adab",
    description: "Pengantar sastera dan gaya bahasa Arab.",
    tagTone: "emerald",
    thumbTone: "emerald",
  },
  {
    id: "manahij-hadith",
    icon: "MH",
    subject: "KBD Manahij Al-Ulum Al-Islamiah",
    topic: "Fahm wal-Istifadah min al-Hadith",
    description: "Pendekatan memahami riwayat dan maksud.",
    tagTone: "emerald",
    thumbTone: "emerald",
  },
];

const MATH_CHAPTERS = [
  {
    id: "chapter-functions",
    icon: "x²",
    title: "Function and Quadratic Equation in One Variable",
    subtitle: "Quadratic Functions and Equations",
    topic: "Functions",
    topics: [
      {
        id: "functions-set",
        label: "Functions",
        topic: "Functions",
        status: "available",
      },
      {
        id: "domain-range-set",
        label: "Domain and Range",
        status: "locked",
      },
      {
        id: "quadratic-expressions-set",
        label: "Quadratic Expressions",
        status: "locked",
      },
      {
        id: "quadratic-equations-set",
        label: "Quadratic Equations in One Variable",
        status: "locked",
      },
    ],
  },
  {
    id: "chapter-number",
    icon: "1",
    title: "Number Bases",
    subtitle: "Number Value and operations",
    topic: "Number Value",
  },
  {
    id: "chapter-logic",
    icon: "🧠",
    title: "Logic Reasoning",
    subtitle: "Pattern and reasoning exercises",
    topic: "Graph Interpretation",
  },
  {
    id: "chapter-set",
    icon: "●",
    title: "Set Operation",
    subtitle: "Union, intersection and notation",
    topic: "Simultaneous Equations",
  },
  {
    id: "chapter-graph",
    icon: "△",
    title: "Networking in Graph Theory",
    subtitle: "Graph interpretation and structure",
    topic: "Graph Interpretation",
  },
  {
    id: "chapter-linear",
    icon: "↗",
    title: "Linear Inequalities in Two Variables",
    subtitle: "Regions and constraints",
    topic: "Quadratic Equation",
  },
  {
    id: "chapter-motion",
    icon: "📈",
    title: "Motion Graph",
    subtitle: "Read and infer from motion graphs",
    topic: "Functions",
  },
];

const MATH_TOPIC_SEQUENCE = Array.from(
  new Set(
    MATH_CHAPTERS.flatMap((chapter) => [
      ...(Array.isArray(chapter.topics)
        ? chapter.topics.map((topicItem) => topicItem.topic).filter(Boolean)
        : []),
      ...(chapter.topic ? [chapter.topic] : []),
    ]),
  ),
);

function getNextMathTopic(currentTopic) {
  if (!currentTopic) {
    return MATH_TOPIC_SEQUENCE[0] || null;
  }

  const currentTopicIndex = MATH_TOPIC_SEQUENCE.indexOf(currentTopic);
  if (currentTopicIndex === -1 || currentTopicIndex >= MATH_TOPIC_SEQUENCE.length - 1) {
    return null;
  }

  return MATH_TOPIC_SEQUENCE[currentTopicIndex + 1];
}

const FIRST_GUIDED_CHAPTER_ID = "chapter-functions";

const RECENT_ACTIVITIES = [
  {
    id: "r1",
    subject: "Mathematics",
    mode: "Quiz",
    title: "1.6 Function and Quadratic Equation",
    topic: "Functions",
    route: "quiz",
    target: "/quiz/functions-quadratic",
  },
  {
    id: "r2",
    subject: "Mathematics",
    mode: "Quiz",
    title: "1.1 Number value",
    topic: "Number Value",
    route: "quiz",
    target: "/quiz/number-value",
  },
  {
    id: "r3",
    subject: "Mathematics",
    mode: "Quiz",
    title: "3.2 Number value",
    topic: "Number Value",
    route: "quiz",
    target: "/quiz/number-value",
  },
];

const APP_PATHS = {
  onboarding: "/",
  onboardingName: "/onboarding/name",
  onboardingReward: "/onboarding/reward",
  onboardingMission: "/onboarding/mission",
  app: "/app",
  quiz: "/app/quiz",
  practice: "/app/practice",
  learn: "/app/learn",
  achievement: "/app/achievement",
};

function createEmptyOnboardingProfile() {
  return {
    preferredLanguage: "",
    learnerName: "",
    selectedReward: "",
  };
}

function createOnboardingSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

function hasPreferredLanguage(profile) {
  return Boolean(profile?.preferredLanguage);
}

function hasLearnerName(profile) {
  return Boolean(normalizeLearnerName(profile?.learnerName));
}

function hasSelectedReward(profile) {
  return Boolean(profile?.selectedReward);
}

function hasCompletedOnboarding(profile) {
  return (
    hasPreferredLanguage(profile) &&
    hasLearnerName(profile) &&
    hasSelectedReward(profile)
  );
}

const LEGACY_PATH_REDIRECTS = [
  { from: "/home", to: APP_PATHS.app },
  { from: "/quiz", to: APP_PATHS.quiz },
  { from: "/quiz/*", to: APP_PATHS.quiz },
  { from: "/practice", to: APP_PATHS.practice },
  { from: "/practice/*", to: APP_PATHS.practice },
  { from: "/learn", to: APP_PATHS.learn },
  { from: "/learn/*", to: APP_PATHS.learn },
  { from: "/achievement", to: APP_PATHS.achievement },
  { from: "/achievement/*", to: APP_PATHS.achievement },
  { from: "/notes/*", to: APP_PATHS.learn },
  { from: "/drill/*", to: APP_PATHS.quiz },
];

const REPORT_CARD_SUMMARY = [
  {
    id: "kssm-am",
    subject: "Additional Mathematics",
    scorePercent: 100,
    yearGrade: "A+",
    questions: 1,
  },
  {
    id: "kssm-math",
    subject: "Mathematics",
    scorePercent: 54,
    yearGrade: "C",
    questions: 13,
  },
];

const SUBJECT_ANALYSIS_BY_ID = {
  "kssm-am": {
    id: "kssm-am",
    subject: "Additional Mathematics",
    grade: "A+",
    scorePercent: 100,
    performance: "CEMERLANG",
    questionsAnswered: 1,
    setsSubmitted: 1,
    difficulty: [
      { id: "easy", label: "Easy", value: 0, tone: "green" },
      { id: "medium", label: "Medium", value: 100, tone: "orange" },
      { id: "hard", label: "Hard", value: 0, tone: "red" },
    ],
    thinking: [
      { id: "lots", label: "LOTS", value: 0, tone: "green" },
      { id: "mots", label: "MOTS", value: 100, tone: "orange" },
      { id: "hots", label: "HOTS", value: 0, tone: "red" },
    ],
    topics: [
      { chapter: 1, name: "Functions", scorePercent: 100, status: "Mastery" },
      {
        chapter: 2,
        name: "Quadratic Functions",
        scorePercent: null,
        status: "Not started",
      },
      {
        chapter: 3,
        name: "Equation Systems",
        scorePercent: null,
        status: "Not started",
      },
      {
        chapter: 4,
        name: "Indices, Surds and Logarithms",
        scorePercent: null,
        status: "Not started",
      },
      { chapter: 5, name: "Progressions", scorePercent: null, status: "Not started" },
      { chapter: 6, name: "Linear Law", scorePercent: null, status: "Not started" },
      {
        chapter: 7,
        name: "Coordinate Geometry",
        scorePercent: null,
        status: "Not started",
      },
    ],
  },
  "kssm-math": {
    id: "kssm-math",
    subject: "Mathematics",
    grade: "C",
    scorePercent: 54,
    performance: "SATISFACTORY",
    questionsAnswered: 13,
    setsSubmitted: 4,
    difficulty: [
      { id: "easy", label: "Easy", value: 58, tone: "green" },
      { id: "medium", label: "Medium", value: 34, tone: "orange" },
      { id: "hard", label: "Hard", value: 8, tone: "red" },
    ],
    thinking: [
      { id: "lots", label: "LOTS", value: 62, tone: "green" },
      { id: "mots", label: "MOTS", value: 40, tone: "orange" },
      { id: "hots", label: "HOTS", value: 16, tone: "red" },
    ],
    topics: [
      { chapter: 1, name: "Number Value", scorePercent: 68, status: "Mastery" },
      {
        chapter: 2,
        name: "Quadratic Equation",
        scorePercent: 45,
        status: "Needs focus",
      },
      { chapter: 3, name: "Functions", scorePercent: 54, status: "Developing" },
      {
        chapter: 4,
        name: "Simultaneous Equations",
        scorePercent: 42,
        status: "Needs focus",
      },
      {
        chapter: 5,
        name: "Graph Interpretation",
        scorePercent: 47,
        status: "Needs focus",
      },
    ],
  },
};

function getStatusTone(status) {
  const value = (status || "").toLowerCase();
  if (value === "mastery") {
    return "mastery";
  }
  if (value.includes("focus") || value.includes("develop")) {
    return "warning";
  }
  return "muted";
}

function AnalysisRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="pandai-analysis-ring" style={{ "--ring-value": `${safeValue}%` }}>
      <div className="pandai-analysis-ring__halo" />
      <div className="pandai-analysis-ring__fill" />
      <div className="pandai-analysis-ring__core" />
      <span className="pandai-analysis-ring__dot is-green" />
      <span className="pandai-analysis-ring__dot is-red" />
    </div>
  );
}

function AnalysisLegend({ items }) {
  return (
    <div className="pandai-analysis-legend">
      {items.map((item) => (
        <div key={item.id} className={`pandai-analysis-legend__item tone-${item.tone}`}>
          <span className="pandai-analysis-legend__dot" />
          <span>{item.label}</span>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  );
}

function AchievementView({ onOpenSubject }) {
  return (
    <section className="pandai-achievement">
      <header className="pandai-achievement-header">
        <h1>Report Card for Form 4</h1>
        <div className="pandai-achievement-breadcrumb">
          Achievement <span>»</span> Report Card for Form 4
        </div>
      </header>

      <article className="pandai-achievement-card">
        <div className="pandai-achievement-card__head">
          <h2>Report Card Summary</h2>
          <div className="pandai-achievement-actions">
            <button type="button" className="pandai-outline-btn">
              Download report card
            </button>
            <button type="button" className="pandai-outline-btn pandai-outline-btn--small">
              Form 4
            </button>
          </div>
        </div>

        <div className="pandai-achievement-table">
          <div className="pandai-achievement-row is-head">
            <div>#</div>
            <div>Subject</div>
            <div>Score</div>
            <div>Year Grade</div>
            <div>Questions</div>
            <div>Analysis</div>
          </div>

          {REPORT_CARD_SUMMARY.map((row, index) => (
            <div key={row.id} className="pandai-achievement-row">
              <div>{index + 1}</div>
              <div className="pandai-achievement-subject-cell">
                <button
                  type="button"
                  className="pandai-achievement-subject-btn"
                  onClick={() => onOpenSubject(row.id)}
                >
                  {row.subject}
                </button>
                <div className="pandai-achievement-progress">
                  <span style={{ width: `${row.scorePercent}%` }} />
                </div>
              </div>
              <div>{row.scorePercent}%</div>
              <div className="pandai-grade-cell">{row.yearGrade}</div>
              <div>{row.questions}</div>
              <div>
                <button
                  type="button"
                  className="pandai-view-btn"
                  onClick={() => onOpenSubject(row.id)}
                >
                  View ›
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SubjectAnalysisView({ analysis, onBackToReport, onOpenTopic }) {
  return (
    <section className="pandai-analysis-page">
      <article className="pandai-analysis-card">
        <div className="pandai-analysis-card__head">
          <h2>{analysis.subject}</h2>
          <div className="pandai-analysis-head-actions">
            <button type="button" className="pandai-outline-btn">
              Download
            </button>
            <button type="button" className="pandai-view-btn" onClick={onBackToReport}>
              Back to report
            </button>
          </div>
        </div>

        <div className="pandai-analysis-grid">
          <div className="pandai-analysis-summary">
            <div className="pandai-analysis-grade">{analysis.grade}</div>
            <div className="pandai-analysis-score">{analysis.scorePercent}%</div>
            <div className="pandai-analysis-label">{analysis.performance}</div>
            <p>{analysis.questionsAnswered} Questions Answered</p>
            <p>{analysis.setsSubmitted} Set Submitted</p>
          </div>

          <div className="pandai-analysis-metric">
            <h3>Result by Difficulty Level</h3>
            <AnalysisRing value={analysis.difficulty[1]?.value || 0} />
            <AnalysisLegend items={analysis.difficulty} />
          </div>

          <div className="pandai-analysis-metric">
            <h3>Result by Thinking Skills</h3>
            <AnalysisRing value={analysis.thinking[1]?.value || 0} />
            <AnalysisLegend items={analysis.thinking} />
          </div>
        </div>

        <div className="pandai-analysis-topic">
          <div className="pandai-analysis-topic__head">
            <h3>Result by Topics</h3>
          </div>

          <div className="pandai-analysis-topic-table">
            <div className="pandai-analysis-topic-row is-head">
              <div>Chapter</div>
              <div>Topic</div>
              <div>Score</div>
              <div>Status</div>
            </div>
            {analysis.topics.map((topic) => (
              <div key={topic.chapter} className="pandai-analysis-topic-row">
                <div>{topic.chapter}</div>
                <div>
                  <button
                    type="button"
                    className="pandai-achievement-subject-btn"
                    onClick={() => onOpenTopic(topic.name)}
                  >
                    {topic.name}
                  </button>
                </div>
                <div>{topic.scorePercent === null ? "-" : `${topic.scorePercent}%`}</div>
                <div className={`pandai-status-badge tone-${getStatusTone(topic.status)}`}>
                  {topic.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

const MISSION_ROUTE_DESKTOP_PATH =
  "M 760 78 C 756 118 688 132 592 176 S 372 248 262 270 S 418 360 608 386 S 382 476 300 500 S 534 586 742 618";

function getMissionMilestoneState(milestoneId, milestones, completedMilestoneIds) {
  if (completedMilestoneIds.has(milestoneId)) {
    return "completed";
  }

  const currentMilestone = milestones.find((milestone) => !completedMilestoneIds.has(milestone.id));
  if (currentMilestone?.id === milestoneId) {
    return "current";
  }

  return "locked";
}

function getMissionMilestoneEyebrow(state) {
  if (state === "completed") {
    return "Completed";
  }

  if (state === "current") {
    return "Current";
  }

  return "Locked";
}

function MissionHubView({ selectedReward, missionContext }) {
  const reward = REWARD_OPTIONS.find((item) => item.id === selectedReward) || REWARD_OPTIONS[0];
  const activeMission =
    MISSION_DEFINITIONS.find((mission) => mission.id === missionContext.activeMissionId) ||
    MISSION_DEFINITIONS.find((mission) => mission.id === STARTER_MISSION_ID) ||
    MISSION_DEFINITIONS[0];
  const milestones = activeMission?.milestones || [];
  const completedMilestoneIds = new Set(missionContext.completedMilestoneIds);
  const completedCount = milestones.filter((milestone) =>
    completedMilestoneIds.has(milestone.id),
  ).length;
  const currentMilestone =
    milestones.find((milestone) => !completedMilestoneIds.has(milestone.id)) || null;
  const progressPercent =
    milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const lockedMission = MISSION_DEFINITIONS.find((mission) => mission.status === "locked");
  const comingSoonMission = MISSION_DEFINITIONS.find(
    (mission) => mission.status === "coming-soon",
  );

  return (
    <section className="pandai-mission-page">
      <div className="pandai-mission-page__grid">
        <div className="pandai-mission-page__main">
          <article className="pandai-mission-panel pandai-mission-panel--journey">
            <header className="pandai-mission-panel__head">
              <div className="pandai-mission-panel__copy">
                <span className="pandai-mission-panel__eyebrow">Mission Hub</span>
                <h1>{activeMission.title}</h1>
                <p>{activeMission.subtitle}</p>
              </div>

                <div className="pandai-mission-panel__progress" aria-label="Mission progress">
                  <div className="pandai-mission-panel__progress-top">
                    <strong>
                      {completedCount} of {milestones.length} completed
                    </strong>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                <div className="pandai-mission-panel__progress-track" aria-hidden="true">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </header>

            <div className="pandai-mission-route pandai-mission-route--desktop">
              <svg
                className="pandai-mission-route__path"
                viewBox="0 0 1000 700"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path d={MISSION_ROUTE_DESKTOP_PATH} />
              </svg>

              {milestones.map((milestone) => {
                const state = getMissionMilestoneState(
                  milestone.id,
                  milestones,
                  completedMilestoneIds,
                );

                return (
                  <article
                    key={milestone.id}
                    className={`pandai-mission-node is-${state} is-card-${milestone.cardSide}`}
                    style={{
                      "--node-top": milestone.desktop.top,
                      "--node-left": milestone.desktop.left,
                    }}
                  >
                    <span className="pandai-mission-node__marker" aria-hidden="true">
                      {state === "completed" ? "✓" : state === "locked" ? "🔒" : ""}
                    </span>
                    <div className="pandai-mission-node__card">
                      <span className="pandai-mission-node__eyebrow">
                        {getMissionMilestoneEyebrow(state)}
                      </span>
                      <strong>{milestone.label}</strong>
                    </div>
                  </article>
                );
              })}

              <div className="pandai-mission-reward-end">
                <div className="pandai-mission-reward-end__orb" aria-hidden="true">
                  <span>{reward.icon}</span>
                </div>
                <strong>{reward.label}</strong>
                <span>Selected reward endpoint</span>
              </div>
            </div>

            <div className="pandai-mission-route pandai-mission-route--mobile">
              <div className="pandai-mission-route-mobile">
                {milestones.map((milestone, index) => {
                  const state = getMissionMilestoneState(
                    milestone.id,
                    milestones,
                    completedMilestoneIds,
                  );

                  return (
                    <article
                      key={milestone.id}
                      className={`pandai-mission-route-mobile__item is-${state} is-${milestone.mobileAlign}`}
                    >
                      <div className="pandai-mission-route-mobile__rail" aria-hidden="true">
                        <span className="pandai-mission-route-mobile__dot">
                          {state === "completed" ? "✓" : state === "locked" ? "🔒" : ""}
                        </span>
                        {index < milestones.length - 1 ? (
                          <span className="pandai-mission-route-mobile__line" />
                        ) : null}
                      </div>

                      <div className="pandai-mission-route-mobile__card">
                        <span className="pandai-mission-node__eyebrow">
                          {getMissionMilestoneEyebrow(state)}
                        </span>
                        <strong>{milestone.label}</strong>
                      </div>
                    </article>
                  );
                })}

                <div className="pandai-mission-route-mobile__reward">
                  <div className="pandai-mission-reward-end__orb" aria-hidden="true">
                    <span>{reward.icon}</span>
                  </div>
                  <strong>{reward.label}</strong>
                  <span>Selected reward endpoint</span>
                </div>
              </div>
            </div>
          </article>

          <div className="pandai-mission-preview-grid">
            {lockedMission ? (
              <article className="pandai-mission-preview-card is-locked">
                <span className="pandai-mission-preview-card__icon" aria-hidden="true">
                  🔒
                </span>
                <div>
                  <strong>{lockedMission.title}</strong>
                  <p>{lockedMission.subtitle}</p>
                </div>
              </article>
            ) : null}

            {comingSoonMission ? (
              <article className="pandai-mission-preview-card is-coming-soon">
                <span className="pandai-mission-preview-card__icon" aria-hidden="true">
                  ⏳
                </span>
                <div>
                  <strong>{comingSoonMission.title}</strong>
                  <p>{comingSoonMission.subtitle}</p>
                </div>
              </article>
            ) : null}
          </div>
        </div>

        <aside className="pandai-mission-sidebar">
          <article className="pandai-mission-panel pandai-mission-panel--sidebar">
            <div className="pandai-mission-sidebar__section">
              <span className="pandai-mission-panel__eyebrow">Selected reward</span>
              <div className="pandai-mission-sidebar__reward">
                <div className={`pandai-mission-sidebar__reward-icon tone-${reward.id}`}>
                  {reward.icon}
                </div>
                <div>
                  <strong>{reward.label}</strong>
                  <p>{reward.brand}</p>
                </div>
              </div>
            </div>

            <div className="pandai-mission-sidebar__section">
              <span className="pandai-mission-panel__eyebrow">Current mission</span>
              <div className="pandai-mission-sidebar__stats">
                <div className="pandai-mission-sidebar__stat">
                  <span>Mission</span>
                  <strong>{activeMission.title}</strong>
                </div>
                <div className="pandai-mission-sidebar__stat">
                  <span>Status</span>
                  <strong>
                    {completedCount} of {milestones.length} done
                  </strong>
                </div>
                <div className="pandai-mission-sidebar__stat">
                  <span>Next milestone</span>
                  <strong>{currentMilestone?.label || "Reward unlocked"}</strong>
                </div>
              </div>
            </div>

            <div className="pandai-mission-sidebar__section">
              <span className="pandai-mission-panel__eyebrow">Legend</span>
              <div className="pandai-mission-sidebar__legend">
                <div className="pandai-mission-sidebar__legend-item">
                  <span className="pandai-mission-sidebar__legend-dot is-completed" />
                  <span>Completed milestone</span>
                </div>
                <div className="pandai-mission-sidebar__legend-item">
                  <span className="pandai-mission-sidebar__legend-dot is-current" />
                  <span>Current milestone</span>
                </div>
                <div className="pandai-mission-sidebar__legend-item">
                  <span className="pandai-mission-sidebar__legend-dot is-locked" />
                  <span>Locked milestone</span>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function WelcomeLanguageScreen({ selectedLanguage, onSelectLanguage, onContinue }) {
  return (
    <div className="pandai-onboarding-shell">
      <div className="pandai-onboarding-frame">
        <section className="pandai-onboarding-card" aria-labelledby="pandai-onboarding-title">
          <div className="pandai-onboarding-check" aria-hidden="true">
            <span>✓</span>
          </div>

          <div className="pandai-onboarding-copy">
            <h1 id="pandai-onboarding-title">Congratulations!</h1>
            <p>To start your lessons, choose your preferred language.</p>
          </div>

          <div className="pandai-language-list" role="radiogroup" aria-label="Preferred language">
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = selectedLanguage === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`pandai-language-option ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectLanguage(option.id)}
                >
                  <span className="pandai-language-option__label">{option.label}</span>
                  <span className="pandai-language-option__control" aria-hidden="true">
                    <span />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="pandai-onboarding-cta"
            disabled={!selectedLanguage}
            onClick={onContinue}
          >
            Start Learning Now
          </button>
        </section>
      </div>
    </div>
  );
}

function WelcomeNameScreen({
  learnerName,
  inputId,
  inputName,
  onNameChange,
  onPickSuggestion,
  onContinue,
}) {
  const suggestions = useMemo(() => buildNameSuggestions(learnerName), [learnerName]);
  const trimmedName = normalizeLearnerName(learnerName);

  return (
    <div className="pandai-onboarding-shell">
      <div className="pandai-onboarding-frame">
        <section
          className="pandai-onboarding-card pandai-onboarding-card--welcome"
          aria-labelledby="pandai-welcome-title"
        >
          <div className="pandai-onboarding-mascot-wrap" aria-hidden="true">
            <div className="pandai-onboarding-mascot-glow" />
            <img
              src={pbotMascot}
              alt=""
              className="pandai-onboarding-mascot"
            />
          </div>

          <div className="pandai-onboarding-copy">
            <h1 id="pandai-welcome-title">Welcome</h1>
            <p>What should we call you?</p>
          </div>

          <form className="pandai-name-form" autoComplete="off" onSubmit={onContinue}>
            <label className="pandai-visually-hidden" htmlFor={inputId}>
              Student name
            </label>
            <input
              key={inputId}
              id={inputId}
              name={inputName}
              type="text"
              className="pandai-name-input"
              placeholder="Type your name"
              autoComplete="off"
              value={learnerName}
              onChange={(event) => onNameChange(event.target.value)}
            />

            <div className="pandai-name-suggestions" aria-label="Name suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`pandai-name-chip ${
                    trimmedName.toLowerCase() === suggestion.toLowerCase() ? "is-selected" : ""
                  }`}
                  onClick={() => onPickSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="pandai-onboarding-cta pandai-onboarding-cta--solid"
              disabled={!trimmedName}
            >
              Continue →
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function RewardSelectionScreen({ learnerName, selectedReward, onSelectReward, onContinue }) {
  const displayName = getLearnerDisplayName(learnerName);
  const hasSelectedReward = Boolean(selectedReward);

  return (
    <div className="pandai-onboarding-shell">
      <div className="pandai-onboarding-frame">
        <section
          className="pandai-onboarding-card pandai-onboarding-card--reward"
          aria-labelledby="pandai-reward-title"
        >
          <div className="pandai-onboarding-check" aria-hidden="true">
            <span>✓</span>
          </div>

          <div className="pandai-onboarding-copy">
            <h1 id="pandai-reward-title">Pick your reward, {displayName}</h1>
            <p>Finish missions to unlock more rewards, then choose one to start with.</p>
          </div>

          <div className="pandai-reward-section">
            <div className="pandai-reward-section__head">
              <strong>Finish missions → get this reward</strong>
            </div>

            <div className="pandai-reward-preview-grid">
              {LOCKED_REWARD_PREVIEWS.map((reward, index) => (
                <article key={reward.id} className="pandai-reward-preview-card">
                  <span className="pandai-reward-preview-card__lock" aria-hidden="true">
                    🔒
                  </span>
                  <div className="pandai-reward-preview-card__brand">{reward.brand}</div>
                  <div className="pandai-reward-preview-card__label">{reward.label}</div>
                  {index === 1 ? (
                    <span className="pandai-reward-preview-card__hint">Unlock next</span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="pandai-reward-section">
            <div className="pandai-reward-section__head">
              <strong>Choose your reward</strong>
            </div>

            <div className="pandai-reward-grid" role="radiogroup" aria-label="Starter reward">
              {REWARD_OPTIONS.map((reward) => {
                const isSelected = selectedReward === reward.id;

                return (
                  <button
                    key={reward.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`pandai-reward-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => onSelectReward(reward.id)}
                  >
                    {reward.tag ? (
                      <span className="pandai-reward-card__tag">{reward.tag}</span>
                    ) : null}

                    <div className={`pandai-reward-card__icon tone-${reward.id}`}>
                      {reward.icon}
                    </div>
                    <div className="pandai-reward-card__brand">{reward.brand}</div>
                    <strong>{reward.label}</strong>
                    <span className="pandai-reward-card__coins">🪙 {reward.cost} coins</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="pandai-onboarding-cta pandai-onboarding-cta--solid pandai-onboarding-cta--reward"
            disabled={!hasSelectedReward}
            onClick={onContinue}
          >
            Start & Earn Coins 🚀
          </button>
        </section>
      </div>
    </div>
  );
}

function RewardMissionScreen({ learnerName, selectedReward, onContinue }) {
  const displayName = getLearnerDisplayName(learnerName);
  const reward = REWARD_OPTIONS.find((item) => item.id === selectedReward) || REWARD_OPTIONS[0];

  const milestones = [
    { coins: 20, label: "Milestone 1" },
    { coins: 40, label: "Milestone 2" },
    { coins: 60, label: "Milestone 3" },
    { coins: 80, label: "Milestone 4" },
    { coins: 100, label: "Milestone 5" },
    { coins: 120, label: "Milestone 6" },
  ];

  return (
    <div className="pandai-onboarding-shell">
      <div className="pandai-onboarding-frame">
        <section
          className="pandai-onboarding-card pandai-onboarding-card--mission"
          aria-labelledby="pandai-mission-title"
        >
          <div className="pandai-onboarding-copy">
            <h1 id="pandai-mission-title">Let's get your reward faster 🚀</h1>
            <p>
              {displayName}, complete small milestones to unlock your
              {" "}
              {reward?.label}
              {" "}
              reward faster.
            </p>
          </div>

          <div className="pandai-mission-flow">
            <div className="pandai-mission-mascot">
              <img src={pbotMascot} alt="" aria-hidden="true" className="pandai-mission-mascot__img" />
            </div>

            <article className="pandai-mission-card">
              <div className="pandai-mission-card__icon">📝</div>
              <strong>1 quiz = 1 coin</strong>
              <p>3-5 min each quiz</p>
            </article>

            <div className="pandai-mission-arrow" aria-hidden="true">→</div>

            <article className="pandai-mission-card">
              <div className="pandai-mission-card__icon">😵</div>
              <strong>120 quizzes</strong>
              <p>About 6-8 hours total</p>
            </article>

            <div className="pandai-mission-arrow" aria-hidden="true">→</div>

            <article className="pandai-mission-card pandai-mission-card--goal">
              <div className="pandai-mission-card__icon">🎯</div>
              <strong>6 milestones</strong>
              <p>Get reward faster</p>
            </article>

            <div className="pandai-mission-mascot pandai-mission-mascot--happy">
              <img src={pbotMascot} alt="" aria-hidden="true" className="pandai-mission-mascot__img" />
            </div>
          </div>

          <div className="pandai-milestone-track">
            <div className="pandai-milestone-track__line" aria-hidden="true" />
            <div className="pandai-milestone-track__items">
              {milestones.map((milestone) => (
                <div key={milestone.coins} className="pandai-milestone-track__item">
                  <strong>{milestone.coins}</strong>
                  <span className="pandai-milestone-track__dot" aria-hidden="true" />
                  <span>{milestone.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="pandai-onboarding-cta pandai-onboarding-cta--solid pandai-onboarding-cta--reward"
            onClick={onContinue}
          >
            Start Mission 🚀
          </button>
        </section>
      </div>
    </div>
  );
}

function PrototypeOnboardingPage({ onboardingProfile, setOnboardingProfile }) {
  const navigate = useNavigate();
  const preferredLanguage = onboardingProfile.preferredLanguage;

  function handleSelectLanguage(language) {
    setOnboardingProfile((current) => ({
      ...current,
      preferredLanguage: language,
    }));
  }

  function handleContinue() {
    if (!preferredLanguage) {
      return;
    }

    navigate(APP_PATHS.onboardingName, { replace: true });
  }

  return (
    <WelcomeLanguageScreen
      selectedLanguage={preferredLanguage}
      onSelectLanguage={handleSelectLanguage}
      onContinue={handleContinue}
    />
  );
}

function PrototypeNamePage({ onboardingProfile, onboardingSessionId, setOnboardingProfile }) {
  const navigate = useNavigate();
  const learnerName = onboardingProfile.learnerName;

  if (!hasPreferredLanguage(onboardingProfile)) {
    return <Navigate to={APP_PATHS.onboarding} replace />;
  }

  function handleContinue(event) {
    event.preventDefault();
    const normalizedName = normalizeLearnerName(learnerName);
    if (!normalizedName) {
      return;
    }

    setOnboardingProfile((current) => ({
      ...current,
      learnerName: normalizedName,
    }));
    navigate(APP_PATHS.onboardingReward, { replace: true });
  }

  function handleNameChange(nextName) {
    setOnboardingProfile((current) => ({
      ...current,
      learnerName: nextName,
    }));
  }

  function handlePickSuggestion(nextName) {
    setOnboardingProfile((current) => ({
      ...current,
      learnerName: nextName,
    }));
  }

  return (
    <WelcomeNameScreen
      learnerName={learnerName}
      inputId={`learner-name-${onboardingSessionId}`}
      inputName={`learner-name-${onboardingSessionId}`}
      onNameChange={handleNameChange}
      onPickSuggestion={handlePickSuggestion}
      onContinue={handleContinue}
    />
  );
}

function PrototypeRewardPage({ onboardingProfile, setOnboardingProfile }) {
  const navigate = useNavigate();
  const normalizedLearnerName = normalizeLearnerName(onboardingProfile.learnerName);
  const selectedReward = onboardingProfile.selectedReward;

  if (!hasPreferredLanguage(onboardingProfile)) {
    return <Navigate to={APP_PATHS.onboarding} replace />;
  }

  if (!normalizedLearnerName) {
    return <Navigate to={APP_PATHS.onboardingName} replace />;
  }

  function handleSelectReward(rewardId) {
    setOnboardingProfile((current) => ({
      ...current,
      selectedReward: rewardId,
    }));
  }

  function handleContinue() {
    if (!selectedReward) {
      return;
    }

    navigate(APP_PATHS.onboardingMission, { replace: true });
  }

  return (
    <RewardSelectionScreen
      learnerName={normalizedLearnerName}
      selectedReward={selectedReward}
      onSelectReward={handleSelectReward}
      onContinue={handleContinue}
    />
  );
}

function PrototypeMissionPage({ onboardingProfile }) {
  const navigate = useNavigate();
  const normalizedLearnerName = normalizeLearnerName(onboardingProfile.learnerName);
  const selectedReward = onboardingProfile.selectedReward;

  if (!hasPreferredLanguage(onboardingProfile)) {
    return <Navigate to={APP_PATHS.onboarding} replace />;
  }

  if (!normalizedLearnerName) {
    return <Navigate to={APP_PATHS.onboardingName} replace />;
  }

  if (!selectedReward) {
    return <Navigate to={APP_PATHS.onboardingReward} replace />;
  }

  function handleContinue() {
    navigate(APP_PATHS.app, { replace: true, state: { showHomeGuide: true } });
  }

  return (
    <RewardMissionScreen
      learnerName={normalizedLearnerName}
      selectedReward={selectedReward}
      onContinue={handleContinue}
    />
  );
}

function PrototypeAppPage({ onboardingProfile }) {
  if (!hasCompletedOnboarding(onboardingProfile)) {
    return <Navigate to={APP_PATHS.onboarding} replace />;
  }

  return (
    <PBotContextProvider profile={onboardingProfile}>
      <AppShell selectedReward={onboardingProfile.selectedReward} />
    </PBotContextProvider>
  );
}

function handleCardKey(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function AppShell({ selectedReward }) {
  const location = useLocation();
  const { userContext, pageContext, quizContext, uiContext, missionContext, actions } =
    usePBotContext();
  const topicPickerRef = useRef(null);
  const learnMenuRef = useRef(null);
  const mathGuideCardRef = useRef(null);
  const chapterGuideCardRef = useRef(null);
  const topicGuideRowRef = useRef(null);
  const questionGuideRef = useRef(null);
  const choiceGuideRef = useRef(null);
  const answerGuideRef = useRef(null);
  const saveGuideRef = useRef(null);
  const progressGuideRef = useRef(null);
  const explanationGuideRef = useRef(null);
  const continueGuideRef = useRef(null);
  const homeGuideKey = location.state?.showHomeGuide ? location.key : null;
  const [analysisSubjectId, setAnalysisSubjectId] = useState("kssm-am");
  const [learnMenuOpen, setLearnMenuOpen] = useState(false);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [openExplanationFor, setOpenExplanationFor] = useState(null);
  const [quizCompletionModal, setQuizCompletionModal] = useState(null);
  const [onboardingGuideStep, setOnboardingGuideStep] = useState(() =>
    homeGuideKey ? "subject" : null,
  );
  const [readGuideSession, setReadGuideSession] = useState({
    countdown: 0,
    key: null,
  });
  const resolvedAnalysisSubjectId =
    pageContext.route === "practice" &&
    pageContext.selectedSubject === "Mathematics" &&
    !quizContext.inProgress
      ? "kssm-math"
      : analysisSubjectId;
  const hasSelectedSubject = Boolean(pageContext.selectedSubject);
  const showQuizWorkspace = pageContext.route === "quiz" && hasSelectedSubject;
  const isMathSelected = pageContext.selectedSubject === "Mathematics";
  const showQuizAttempt = showQuizWorkspace && isMathSelected && quizContext.inProgress;
  const analysisData = useMemo(
    () => SUBJECT_ANALYSIS_BY_ID[resolvedAnalysisSubjectId] || SUBJECT_ANALYSIS_BY_ID["kssm-am"],
    [resolvedAnalysisSubjectId],
  );
  const showAchievementView = pageContext.route === "achievement";
  const showLearnView = pageContext.route === "learn";
  const showMissionHubView = pageContext.route === "mission";
  const showPracticeAnalysisView = pageContext.route === "practice" && Boolean(analysisData);
  const currentQuestion = quizContext.currentQuestion;
  const displayQuestionIndex = quizContext.displayIndex ?? quizContext.currentIndex;
  const questionNumber = Math.min(displayQuestionIndex + 1, quizContext.total);
  const questionProgress = `${questionNumber} / ${quizContext.total}`;
  const progressTrackPercent =
    (quizContext.correctCount / Math.max(quizContext.total, 1)) * 100;
  const scorePercent = Math.round(progressTrackPercent);
  const incorrectCount = Math.max(quizContext.total - quizContext.correctCount, 0);
  const starCount = QUIZ_STAR_THRESHOLDS.filter(
    (threshold) => progressTrackPercent >= threshold,
  ).length;
  const isFinalQuizQuestion = quizContext.currentIndex === Math.max(quizContext.total - 1, 0);
  const isFinalReviewMode = quizContext.isReviewingFinalSet;
  const isReviewingFinalQuestion = displayQuestionIndex === Math.max(quizContext.total - 1, 0);
  const showReviewPrevious =
    quizContext.saved && isFinalReviewMode && displayQuestionIndex > 0;
  const showSubmitAnswer =
    quizContext.saved && isFinalReviewMode && isReviewingFinalQuestion;
  const activeQuizCompletionKey = `${pageContext.selectedTopic || ""}:${quizContext.total}:${
    quizContext.answeredCount
  }:${quizContext.correctCount}:${quizContext.currentIndex}:${
    quizContext.isReviewingFinalSet ? "review" : "active"
  }`;
  const showQuizCompletionModal =
    Boolean(quizCompletionModal) &&
    showQuizAttempt &&
    quizCompletionModal.quizKey === activeQuizCompletionKey;
  const submittedOnLabel = useMemo(
    () => formatSubmissionDate(quizCompletionModal?.submittedAt),
    [quizCompletionModal],
  );
  const nextTopic = getNextMathTopic(pageContext.selectedTopic);
  const completionHeading =
    scorePercent >= 100 ? "Excellent!" : scorePercent >= 70 ? "Sufficient!" : "Keep going!";
  const completionMessage =
    scorePercent >= 100
      ? "Perfect score. You are ready to move on."
      : scorePercent >= 70
        ? "Hasil yang cemerlang! Just one more star to conquer this topic."
        : "Good effort. Practise another set to strengthen this topic.";
  const completionCoinReward = starCount > 0 ? 1 : 0;
  const completionHeartDelta = incorrectCount > 0 ? -1 : 0;
  const completionCoachTitle =
    scorePercent >= 100 ? "Amazing work! 🎉" : scorePercent >= 70 ? "Nice work! 🎉" : "Good try! 💪";
  const completionCoachSummary = `${quizContext.correctCount} right, ${incorrectCount} wrong${
    scorePercent >= 70 ? ". Good progress!" : "."
  }`;
  const completionCoachRewardLine =
    completionHeartDelta < 0
      ? `+${quizContext.correctCount} points • +${completionCoinReward} ${
          completionCoinReward === 1 ? "coin" : "coins"
        } • -${Math.abs(completionHeartDelta)} ${
          Math.abs(completionHeartDelta) === 1 ? "life" : "lives"
        }`
      : `+${quizContext.correctCount} points • +${completionCoinReward} ${
          completionCoinReward === 1 ? "coin" : "coins"
        }`;
  const completionCoachPrompt = "Tap Practise new set 👉";
  const ordinalQuestionLabel = getEnglishOrdinalQuestionLabel(
    questionNumber,
    quizContext.total,
  );
  const ordinalQuestionTitle = capitalizeLabel(ordinalQuestionLabel);
  const explanationKey = `${displayQuestionIndex}:${quizContext.saved ? "saved" : "pending"}:${
    quizContext.isReviewingFinalSet ? "review" : "active"
  }`;
  const isExplanationOpen = openExplanationFor === explanationKey;
  const learnerName = getLearnerDisplayName(userContext.name);
  const learnerInitial = getLearnerInitial(userContext.name);
  const showHomeSubjectGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "subject" &&
    pageContext.route === "home" &&
    !pageContext.selectedSubject;
  const showChapterSelectionGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "chapter" &&
    showQuizWorkspace &&
    isMathSelected &&
    !quizContext.inProgress;
  const showTopicStartGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "topic" &&
    showQuizWorkspace &&
    isMathSelected &&
    expandedChapterId === FIRST_GUIDED_CHAPTER_ID &&
    !quizContext.inProgress;
  const showQuestionReadGuide =
    Boolean(homeGuideKey) &&
    (
      onboardingGuideStep === "question" ||
      onboardingGuideStep === "question-wrong" ||
      onboardingGuideStep === "question-later"
    ) &&
    showQuizAttempt;
  const showAnswerChoiceGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "choices" &&
    showQuizAttempt;
  const showCorrectAnswerGuide =
    Boolean(homeGuideKey) &&
    (onboardingGuideStep === "answer" || onboardingGuideStep === "answer-third") &&
    showQuizAttempt;
  const showWrongAnswerGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "answer-wrong" &&
    showQuizAttempt;
  const showSaveAnswerGuide =
    Boolean(homeGuideKey) &&
    (onboardingGuideStep === "save" || onboardingGuideStep === "save-wrong") &&
    showQuizAttempt &&
    Boolean(quizContext.selectedOption) &&
    !quizContext.saved;
  const guidedWrongOptionId = useMemo(() => {
    if (!showQuizAttempt || quizContext.currentIndex !== SECOND_GUIDED_QUESTION_INDEX) {
      return null;
    }

    const preferredOption = currentQuestion.options.find(
      (choice) =>
        choice.id === SECOND_GUIDED_WRONG_OPTION_ID &&
        choice.id !== currentQuestion.correctOption,
    );

    if (preferredOption) {
      return preferredOption.id;
    }

    return (
      currentQuestion.options.find((choice) => choice.id !== currentQuestion.correctOption)?.id ||
      null
    );
  }, [
    currentQuestion.correctOption,
    currentQuestion.options,
    quizContext.currentIndex,
    showQuizAttempt,
  ]);
  const showGuidedAnswerGuide = showCorrectAnswerGuide || showWrongAnswerGuide;
  const showWrongResultGuidePending =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "wrong-result" &&
    showQuizAttempt &&
    (quizContext.checking || (quizContext.saved && !quizContext.isCorrect));
  const showWrongResultGuide =
    showWrongResultGuidePending && quizContext.saved && !quizContext.isCorrect;
  const showProgressGuidePending =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "progress" &&
    showQuizAttempt &&
    (quizContext.checking || (quizContext.saved && quizContext.isCorrect));
  const showProgressBarGuide =
    showProgressGuidePending && quizContext.saved && quizContext.isCorrect;
  const showFinalProgressBarCopy =
    showProgressBarGuide &&
    isFinalQuizQuestion &&
    quizContext.correctCount < quizContext.total;
  const showWrongProgressBarGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "progress-wrong" &&
    showQuizAttempt &&
    quizContext.saved &&
    !quizContext.isCorrect;
  const showExplanationGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "explanation" &&
    showQuizAttempt &&
    quizContext.saved &&
    quizContext.isCorrect &&
    !isExplanationOpen;
  const showWrongExplanationGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "explanation-wrong" &&
    showQuizAttempt &&
    quizContext.saved &&
    !quizContext.isCorrect &&
    !isExplanationOpen;
  const showContinueGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "continue" &&
    showQuizAttempt &&
    quizContext.saved &&
    quizContext.isCorrect &&
    isExplanationOpen;
  const showWrongContinueGuide =
    Boolean(homeGuideKey) &&
    onboardingGuideStep === "continue-wrong" &&
    showQuizAttempt &&
    quizContext.saved &&
    !quizContext.isCorrect &&
    isExplanationOpen;
  const showAnyExplanationGuide = showExplanationGuide || showWrongExplanationGuide;
  const showAnyContinueGuide = showContinueGuide || showWrongContinueGuide;
  const showLockedContinueGuide = showAnyContinueGuide && !showSubmitAnswer;
  const readGuideSessionKey = showQuestionReadGuide
    ? `${quizContext.currentIndex}:${onboardingGuideStep}`
    : null;
  const isActiveReadGuideSession = readGuideSession.key === readGuideSessionKey;
  const readGuideCountdown = readGuideSessionKey
    ? isActiveReadGuideSession
      ? readGuideSession.countdown
      : Math.ceil(READ_GUIDE_LOCK_MS / 1000)
    : 0;
  const readGuideLocked = Boolean(readGuideSessionKey) && readGuideCountdown > 0;
  const readGuideHelperText = readGuideLocked
    ? `Take a moment to read first • ${Math.max(readGuideCountdown, 1)}s`
    : "Continue when you're ready 👇";
  const hasBlockingQuizAttemptGuide =
    showQuestionReadGuide ||
    showAnswerChoiceGuide ||
    showGuidedAnswerGuide ||
    showSaveAnswerGuide ||
    showWrongResultGuidePending ||
    showProgressGuidePending ||
    showWrongProgressBarGuide ||
    showAnyExplanationGuide ||
    showLockedContinueGuide;
  const showQuizAttemptGuide = hasBlockingQuizAttemptGuide;
  const showFinalReviewCallout =
    showSubmitAnswer && !hasBlockingQuizAttemptGuide && !showQuizCompletionModal;
  const showVisibleContinueGuide =
    (showAnyContinueGuide || showFinalReviewCallout) && !showQuizCompletionModal;
  const showAppGuide =
    showHomeSubjectGuide ||
    showChapterSelectionGuide ||
    showTopicStartGuide ||
    showQuizAttemptGuide;
  const activeGuideTitleId = showTopicStartGuide
    ? "pandai-topic-guide-title"
    : "pandai-chapter-guide-title";
  const chapterGuideTitle = showTopicStartGuide
    ? "Start your first set"
    : "Explore chapters";
  const chapterGuideBody = showTopicStartGuide
    ? "Tap Start to begin the next available set in this chapter."
    : "This page shows the chapters in your selected subject. Open the first chapter to see available topics.";

  useEffect(() => {
    if (!uiContext.topicPickerHighlighted || !topicPickerRef.current) {
      return;
    }

    topicPickerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    topicPickerRef.current.focus({ preventScroll: true });
  }, [uiContext.topicPickerHighlighted]);

  useEffect(() => {
    if (!learnMenuOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!learnMenuRef.current || learnMenuRef.current.contains(event.target)) {
        return;
      }
      setLearnMenuOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setLearnMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [learnMenuOpen]);

  useEffect(() => {
    if (!showHomeSubjectGuide || !mathGuideCardRef.current) {
      return;
    }

    mathGuideCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showHomeSubjectGuide]);

  useEffect(() => {
    if (!showChapterSelectionGuide || !chapterGuideCardRef.current) {
      return;
    }

    chapterGuideCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showChapterSelectionGuide]);

  useEffect(() => {
    if (!showTopicStartGuide || !topicGuideRowRef.current) {
      return;
    }

    topicGuideRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showTopicStartGuide]);

  useEffect(() => {
    if (!showQuestionReadGuide || !questionGuideRef.current) {
      return;
    }

    questionGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showQuestionReadGuide]);

  useEffect(() => {
    if (!readGuideSessionKey) {
      return undefined;
    }

    const unlockAt = Date.now() + READ_GUIDE_LOCK_MS;
    let countdownInterval = null;

    function syncReadGuideCountdown() {
      const remainingMs = unlockAt - Date.now();
      const countdown = remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);

      setReadGuideSession({
        countdown,
        key: readGuideSessionKey,
      });

      if (remainingMs <= 0 && countdownInterval !== null) {
        window.clearInterval(countdownInterval);
      }
    }

    const kickoffTimeout = window.setTimeout(() => {
      syncReadGuideCountdown();
      countdownInterval = window.setInterval(syncReadGuideCountdown, 150);
    }, 0);

    return () => {
      window.clearTimeout(kickoffTimeout);
      if (countdownInterval !== null) {
        window.clearInterval(countdownInterval);
      }
    };
  }, [readGuideSessionKey]);

  useEffect(() => {
    if (!showAnswerChoiceGuide || !choiceGuideRef.current) {
      return;
    }

    choiceGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showAnswerChoiceGuide]);

  useEffect(() => {
    if (!showGuidedAnswerGuide || !answerGuideRef.current) {
      return;
    }

    answerGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showGuidedAnswerGuide]);

  useEffect(() => {
    if (!showSaveAnswerGuide || !saveGuideRef.current) {
      return;
    }

    saveGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showSaveAnswerGuide]);

  useEffect(() => {
    if ((!showProgressBarGuide && !showWrongProgressBarGuide) || !progressGuideRef.current) {
      return;
    }

    progressGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showProgressBarGuide, showWrongProgressBarGuide]);

  useEffect(() => {
    if (!showAnyExplanationGuide || !explanationGuideRef.current) {
      return;
    }

    explanationGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showAnyExplanationGuide]);

  useEffect(() => {
    if (!showVisibleContinueGuide || !continueGuideRef.current) {
      return;
    }

    continueGuideRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showVisibleContinueGuide]);

  function selectSubject(subject) {
    if (showHomeSubjectGuide && subject !== "Mathematics") {
      return;
    }

    setOpenExplanationFor(null);
    setExpandedChapterId(null);
    if (showHomeSubjectGuide && subject === "Mathematics") {
      setOnboardingGuideStep("chapter");
    }
    actions.setSelectedSubject(subject);
    actions.clearTopic();
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function openRecentActivity(activity) {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.setLastActivity(activity);
    if (activity.subject === "Mathematics") {
      actions.startQuiz({ topic: activity.topic, total: 5 });
      return;
    }
    actions.setRoute(activity.route || "quiz");
    actions.setSelectedSubject(activity.subject);
    actions.setSelectedTopic(activity.topic);
    actions.stopQuiz();
  }

  function openSubjectAnalysis(subjectId) {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    const reportRow = REPORT_CARD_SUMMARY.find((row) => row.id === subjectId);
    setAnalysisSubjectId(subjectId);
    actions.setSelectedSubject(reportRow?.subject || null);
    actions.clearTopic();
    actions.setRoute("practice");
    actions.stopQuiz();
  }

  function openReportCard() {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.setRoute("achievement");
    actions.stopQuiz();
  }

  function openLearnSubView(view, options = {}) {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    const fallbackSubject = pageContext.selectedSubject || "Mathematics";
    const fallbackTopic =
      pageContext.selectedTopic || (fallbackSubject === "Mathematics" ? "Functions" : "");

    actions.openLearnView(view, {
      subject: fallbackSubject,
      topic: fallbackTopic,
      ...options,
    });
    setLearnMenuOpen(false);
  }

  function goPracticeFromBookmarks() {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.setRoute("practice");
    if (!pageContext.selectedSubject) {
      actions.setSelectedSubject("Mathematics");
      actions.setSelectedTopic("Functions");
    }
    actions.stopQuiz();
  }

  function returnToReportCard() {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.setRoute("achievement");
    actions.stopQuiz();
  }

  function openTopicFromAnalysis(topic) {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.setSelectedSubject("Mathematics");
    actions.setSelectedTopic(topic);
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function openMissionHub() {
    if (showAppGuide || !missionContext.hubUnlocked) {
      return;
    }

    setOpenExplanationFor(null);
    setExpandedChapterId(null);
    actions.openMissionHub();
  }

  function changeSubject() {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    setExpandedChapterId(null);
    actions.setSelectedSubject(null);
    actions.clearTopic();
    actions.setRoute("home");
    actions.stopQuiz();
  }

  function switchToMathematics() {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    setExpandedChapterId(null);
    actions.setSelectedSubject("Mathematics");
    actions.clearTopic();
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function startTopicQuiz(topic, total = 5) {
    setOpenExplanationFor(null);
    setOnboardingGuideStep(showTopicStartGuide ? "question" : null);
    actions.setSelectedTopic(topic);
    actions.startQuiz({ topic, total });
  }

  function handleChapterToggle(chapter) {
    const isExpandable = Boolean(chapter.topics?.length);

    if (!isExpandable || showTopicStartGuide) {
      return;
    }

    setExpandedChapterId((current) =>
      current === chapter.id ? null : chapter.id,
    );

    if (showChapterSelectionGuide && chapter.id === FIRST_GUIDED_CHAPTER_ID) {
      setOnboardingGuideStep("topic");
    }
  }

  function backToChapters() {
    if (showQuizAttemptGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.stopQuiz();
  }

  function saveAnswer() {
    if (showQuestionReadGuide || showAnswerChoiceGuide || showGuidedAnswerGuide) {
      return;
    }

    if (showSaveAnswerGuide) {
      setOnboardingGuideStep(
        onboardingGuideStep === "save" ? "progress" : "wrong-result",
      );
    }

    actions.saveQuizAnswer();
  }

  function submitQuizSet() {
    if (showQuizAttemptGuide && !showAnyContinueGuide) {
      return;
    }

    setOpenExplanationFor(null);
    setOnboardingGuideStep(null);
    if (!missionContext.hubUnlocked) {
      actions.unlockMissionHub();
    }
    setQuizCompletionModal({
      submittedAt: new Date().toISOString(),
      quizKey: activeQuizCompletionKey,
    });
  }

  function closeQuizCompletionModal() {
    setQuizCompletionModal(null);
  }

  function practiceNewSet() {
    if (missionContext.hubUnlocked && !missionContext.hasViewedHub) {
      closeQuizCompletionModal();
      openMissionHub();
      return;
    }

    closeQuizCompletionModal();
    startTopicQuiz(pageContext.selectedTopic || "Functions", quizContext.total);
  }

  function startNextTopicQuiz() {
    if (!nextTopic) {
      return;
    }

    closeQuizCompletionModal();
    startTopicQuiz(nextTopic, quizContext.total);
  }

  function previousReviewQuestion() {
    if (showQuizAttemptGuide || !quizContext.isReviewingFinalSet) {
      return;
    }

    setOpenExplanationFor(null);
    actions.previousReviewQuestion();
  }

  function nextQuestion() {
    if (showContinueGuide && showSubmitAnswer) {
      submitQuizSet();
      return;
    }

    if (showContinueGuide) {
      let nextGuideStep = null;

      if (Boolean(homeGuideKey) && quizContext.currentIndex === 0) {
        nextGuideStep = "question-wrong";
      } else if (
        Boolean(homeGuideKey) &&
        quizContext.currentIndex >= THIRD_GUIDED_QUESTION_INDEX &&
        quizContext.currentIndex < quizContext.total - 1
      ) {
        nextGuideStep = "question-later";
      }

      setOnboardingGuideStep(nextGuideStep);
      setOpenExplanationFor(null);
      actions.nextQuizQuestion();
      return;
    }

    if (showWrongContinueGuide && showSubmitAnswer) {
      submitQuizSet();
      return;
    }

    if (showWrongContinueGuide) {
      setOnboardingGuideStep(
        Boolean(homeGuideKey) && quizContext.currentIndex === SECOND_GUIDED_QUESTION_INDEX
          ? "question-later"
          : null,
      );
      setOpenExplanationFor(null);
      actions.nextQuizQuestion();
      return;
    }

    if (showQuizAttemptGuide) {
      return;
    }

    setOpenExplanationFor(null);
    actions.nextQuizQuestion();
  }

  function selectAnswer(optionId) {
    if (
      showQuestionReadGuide ||
      showAnswerChoiceGuide ||
      showSaveAnswerGuide ||
      quizContext.isReviewingFinalSet
    ) {
      return;
    }

    if (showCorrectAnswerGuide) {
      if (optionId !== currentQuestion.correctOption) {
        return;
      }

      actions.selectQuizOption(optionId);
      setOnboardingGuideStep("save");
      return;
    }

    if (showWrongAnswerGuide) {
      if (optionId !== guidedWrongOptionId) {
        return;
      }

      actions.selectQuizOption(optionId);
      setOnboardingGuideStep("save-wrong");
      return;
    }

    if (quizContext.eliminatedOptions.includes(optionId)) {
      return;
    }
    actions.selectQuizOption(optionId);
  }

  function advanceToChoiceGuide() {
    if (readGuideLocked) {
      return;
    }

    if (onboardingGuideStep === "question-wrong") {
      setOnboardingGuideStep("answer-wrong");
      return;
    }

    if (onboardingGuideStep === "question-later") {
      setOnboardingGuideStep("answer-third");
      return;
    }

    setOnboardingGuideStep("choices");
  }

  function advanceToAnswerGuide() {
    setOnboardingGuideStep("answer");
  }

  function advanceFromProgressGuide() {
    if (showSubmitAnswer) {
      setOnboardingGuideStep(null);
      return;
    }

    setOnboardingGuideStep("explanation");
  }

  function advanceFromWrongResultGuide() {
    setOnboardingGuideStep("progress-wrong");
  }

  function advanceFromWrongProgressGuide() {
    if (showSubmitAnswer) {
      setOnboardingGuideStep(null);
      return;
    }

    setOnboardingGuideStep("explanation-wrong");
  }

  function toggleExplanation() {
    if (showWrongResultGuidePending || showProgressGuidePending || showWrongProgressBarGuide) {
      return;
    }

    if (showExplanationGuide) {
      setOpenExplanationFor(explanationKey);
      setOnboardingGuideStep("continue");
      return;
    }

    if (showWrongExplanationGuide) {
      setOpenExplanationFor(explanationKey);
      setOnboardingGuideStep("continue-wrong");
      return;
    }

    setOpenExplanationFor((current) =>
      current === explanationKey ? null : explanationKey,
    );
  }

  function handleMenuSelect(route) {
    if (showAppGuide) {
      return;
    }

    setOpenExplanationFor(null);
    setLearnMenuOpen(false);
    if (route === "mission") {
      openMissionHub();
      return;
    }
    actions.setRoute(route);
    if (route === "home") {
      setExpandedChapterId(null);
      actions.setSelectedSubject(null);
      actions.clearTopic();
    }
    if (route === "practice" && !analysisSubjectId) {
      setAnalysisSubjectId("kssm-am");
    }
    if (route === "achievement") {
      actions.clearTopic();
    }
    if (route !== "quiz") {
      setExpandedChapterId(null);
      actions.stopQuiz();
    }
  }

  return (
    <>
      <div className="pandai-shell">
        <header className="pandai-topbar">
          <div className="pandai-brand">
            <div className="pandai-brand__gem" aria-hidden="true" />
            <div className="pandai-brand__wordmark">Pandai</div>
          </div>

          <div className="pandai-actions">
            <button type="button" className="pandai-icon-btn">
              S
            </button>
            <button type="button" className="pandai-icon-btn">
              F
            </button>
            <button type="button" className="pandai-icon-btn">
              N
            </button>
            <button type="button" className="pandai-icon-btn">
              G
            </button>
            <div className="pandai-user-pill">
              <div className="pandai-user-meta">
                <span className="pandai-user-meta__eyebrow">Student</span>
                <strong>{learnerName}</strong>
              </div>
              <div className="pandai-avatar">{learnerInitial}</div>
            </div>
          </div>
        </header>

        <main className="pandai-main">
          <section className={`pandai-menu ${showAppGuide ? "is-locked" : ""}`}>
            {TOP_MENU.map((item) => {
              const isMissionItem = item.id === "mission";
              const isMissionLocked = isMissionItem && !missionContext.hubUnlocked;

              return item.id === "learn" ? (
                <div key={item.id} className="pandai-menu__dropdown" ref={learnMenuRef}>
                  <button
                    type="button"
                    className={`pandai-menu__item ${
                      pageContext.route === item.id ? "is-active" : ""
                    } ${learnMenuOpen ? "is-open" : ""}`}
                    aria-haspopup="menu"
                    aria-expanded={learnMenuOpen}
                    disabled={showAppGuide}
                    onClick={() => setLearnMenuOpen((prev) => !prev)}
                  >
                    <span className="pandai-menu__dot" aria-hidden="true" />
                    {item.label}
                    <span className="pandai-menu__caret" aria-hidden="true">
                      v
                    </span>
                  </button>

                  {learnMenuOpen ? (
                    <div className="pandai-learn-dropdown" role="menu" aria-label="Learn menu">
                      {LEARN_MENU_ITEMS.map((learnItem) => (
                        <button
                          key={learnItem.view}
                          type="button"
                          role="menuitem"
                          className={`pandai-learn-dropdown__item ${
                            (pageContext.learnView || "hub") === learnItem.view ? "is-active" : ""
                          }`}
                          onClick={() => openLearnSubView(learnItem.view)}
                        >
                          <span className="pandai-learn-dropdown__icon" aria-hidden="true">
                            []
                          </span>
                          <span>{learnItem.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className={`pandai-menu__item ${
                    pageContext.route === item.id ? "is-active" : ""
                  } ${isMissionLocked ? "is-locked" : ""}`}
                  disabled={showAppGuide || isMissionLocked}
                  onClick={() => handleMenuSelect(item.id)}
                >
                  <span className="pandai-menu__dot" aria-hidden="true" />
                  {item.label}
                  {isMissionLocked ? (
                    <span className="pandai-menu__lock" aria-hidden="true">
                      🔒
                    </span>
                  ) : null}
                </button>
              )
            })}
          </section>

          {showQuizWorkspace ? (
            showQuizAttempt ? (
              <section
                className={`pandai-quiz-attempt ${
                  showQuestionReadGuide
                    ? "is-question-guided"
                    : showAnswerChoiceGuide
                      ? "is-choice-guided"
                      : showGuidedAnswerGuide
                        ? "is-answer-guided"
                        : showSaveAnswerGuide
                        ? "is-save-guided"
                          : showProgressGuidePending || showWrongProgressBarGuide
                            ? "is-progress-guided"
                            : showAnyExplanationGuide
                              ? "is-explanation-guided"
                              : showLockedContinueGuide
                                ? "is-continue-guided"
                                : ""
                }${showGuidedAnswerGuide && onboardingGuideStep === "answer-third" ? " is-answer-guided-later" : ""}`}
              >
                <div
                  ref={showProgressBarGuide || showWrongProgressBarGuide ? progressGuideRef : null}
                  className="pandai-attempt-top"
                >
                  <div className="pandai-attempt-subject">
                    <button
                      type="button"
                      className="pandai-attempt-back"
                      aria-label="Back to chapter list"
                      disabled={showQuizAttemptGuide}
                      onClick={backToChapters}
                    >
                      ←
                    </button>
                    <span className="pandai-current-subject__icon">∂</span>
                    <strong>Mathematics</strong>
                  </div>

                  <div className="pandai-attempt-track-shell">
                    <div className="pandai-attempt-track-stars" aria-hidden="true">
                      {QUIZ_STAR_THRESHOLDS.map((threshold, index) => {
                        const isLastStar = index === QUIZ_STAR_THRESHOLDS.length - 1;
                        const isStarActive = progressTrackPercent >= threshold;

                        return (
                          <span
                            key={threshold}
                            className={`pandai-attempt-track__star ${
                              isStarActive ? "is-active" : ""
                            } ${isLastStar ? "is-end" : ""}`}
                            style={{ left: `${threshold}%` }}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>
                    <div
                      className="pandai-attempt-track"
                      role="progressbar"
                      aria-label="Quiz score progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progressTrackPercent)}
                      aria-valuetext={`${quizContext.correctCount} correct answers, ${starCount} of 3 stars`}
                    >
                      <div
                        className="pandai-attempt-track__fill"
                        style={{ width: `${progressTrackPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <article className="pandai-attempt-card">
                  {showQuestionReadGuide ? (
                    <div
                      className="pandai-question-guide"
                      role="dialog"
                      aria-labelledby="pandai-question-guide-title"
                    >
                      <img
                        src={pbotMascot}
                        alt=""
                        aria-hidden="true"
                        className="pandai-question-guide__mascot"
                      />
                      <div className="pandai-question-guide__bubble">
                        <h3 id="pandai-question-guide-title">
                          {ordinalQuestionTitle} 👇
                        </h3>
                        <p>
                          {isFinalQuizQuestion
                            ? "Take a moment to read your last question 🧠"
                            : "Take a moment to read it 🧠"}
                        </p>
                        <button
                          type="button"
                          className={`pandai-question-guide__next ${
                            readGuideLocked ? "is-read-locked" : ""
                          }`}
                          disabled={readGuideLocked}
                          onClick={advanceToChoiceGuide}
                        >
                          Next
                        </button>
                        <span className="pandai-question-guide__helper">
                          {readGuideHelperText}
                        </span>
                      </div>
                    </div>
                  ) : showAnswerChoiceGuide ? (
                    <div
                      className="pandai-question-guide pandai-question-guide--choices"
                      role="dialog"
                      aria-labelledby="pandai-choice-guide-title"
                    >
                      <img
                        src={pbotMascot}
                        alt=""
                        aria-hidden="true"
                        className="pandai-question-guide__mascot"
                      />
                      <div className="pandai-question-guide__bubble">
                        <h3 id="pandai-choice-guide-title">
                          {ordinalQuestionTitle}: answer choices 👇
                        </h3>
                        <p>
                          {isFinalQuizQuestion
                            ? "Pick one here. This is your last question ✅"
                            : "You can pick one from here ✅"}
                        </p>
                        <button
                          type="button"
                          className="pandai-question-guide__next"
                          onClick={advanceToAnswerGuide}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : showGuidedAnswerGuide ? (
                    <div
                      className={`pandai-question-guide pandai-question-guide--answer ${
                        showWrongAnswerGuide ? "pandai-question-guide--answer-wrong" : ""
                      } ${
                        onboardingGuideStep === "answer-third"
                          ? "pandai-question-guide--answer-third"
                          : ""
                      }`}
                      role="dialog"
                      aria-labelledby="pandai-answer-guide-title"
                    >
                      <img
                        src={pbotMascot}
                        alt=""
                        aria-hidden="true"
                        className="pandai-question-guide__mascot"
                      />
                      <div className="pandai-question-guide__bubble">
                        <h3 id="pandai-answer-guide-title">
                          {onboardingGuideStep === "answer-third"
                            ? "This one looks promising 👀"
                            : showWrongAnswerGuide
                            ? "This might not be the answer 👀"
                            : "Try this answer 👇"}
                        </h3>
                        {onboardingGuideStep === "answer-third" ? (
                          <p>Let's try this one 👇</p>
                        ) : (
                          <p>
                            {showWrongAnswerGuide
                              ? "Try it anyway 👇"
                              : "We'll guide you along the way 🚀"}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <header className="pandai-attempt-card__header">
                    <h2>{currentQuestion.title}</h2>
                    <div className="pandai-attempt-counter">
                      <span aria-hidden="true">▲</span> {questionProgress}
                    </div>
                  </header>

                  <div className="pandai-attempt-grid">
                    <div
                      ref={showQuestionReadGuide ? questionGuideRef : null}
                      className={`pandai-attempt-question ${
                        showQuestionReadGuide ? "is-guide-focus" : ""
                      }`}
                    >
                      <p className="pandai-attempt-equation">{currentQuestion.prompt}</p>
                      <ol className="pandai-attempt-expression-list">
                        {currentQuestion.options.map((choice) => (
                          <li key={choice.id}>
                            ({choice.id}) {choice.text}
                          </li>
                        ))}
                      </ol>
                      {quizContext.showHint ? (
                        <div className="pandai-attempt-hint">
                          Hint: {currentQuestion.hint}
                        </div>
                      ) : null}
                    </div>

                    <div
                      ref={showAnswerChoiceGuide ? choiceGuideRef : null}
                      className={`pandai-attempt-choice-list ${
                        showAnswerChoiceGuide ? "is-guide-focus" : ""
                      }`}
                    >
                      {currentQuestion.options.map((choice) => {
                        const isSelected = quizContext.selectedOption === choice.id;
                        const isEliminated =
                          quizContext.eliminatedOptions.includes(choice.id) && !isSelected;
                        const isGuideAnswerFocus =
                          showCorrectAnswerGuide &&
                          choice.id === currentQuestion.correctOption;
                        const isGuideWrongAnswerFocus =
                          showWrongAnswerGuide && choice.id === guidedWrongOptionId;
                        const isGuideSaveFocus =
                          showSaveAnswerGuide &&
                          choice.id === quizContext.selectedOption;
                        const isCorrectChoice =
                          quizContext.saved &&
                          choice.id === currentQuestion.correctOption;
                        const isWrongChoice =
                          quizContext.saved &&
                          choice.id === quizContext.selectedOption &&
                          !quizContext.isCorrect;

                        return (
                          <button
                            key={choice.id}
                            ref={isGuideAnswerFocus || isGuideWrongAnswerFocus ? answerGuideRef : null}
                            type="button"
                            className={`pandai-attempt-choice ${
                              isSelected ? "is-selected" : ""
                            } ${isEliminated ? "is-eliminated" : ""} ${
                              isCorrectChoice ? "is-correct" : ""
                            } ${isWrongChoice ? "is-wrong" : ""} ${
                              isGuideAnswerFocus || isGuideWrongAnswerFocus ? "is-guide-answer" : ""
                            } ${isGuideSaveFocus ? "is-guide-save-answer" : ""}`}
                            disabled={
                              showQuestionReadGuide ||
                              showAnswerChoiceGuide ||
                              showSaveAnswerGuide ||
                              quizContext.isReviewingFinalSet ||
                              (showCorrectAnswerGuide &&
                                choice.id !== currentQuestion.correctOption) ||
                              (showWrongAnswerGuide && choice.id !== guidedWrongOptionId) ||
                              isEliminated ||
                              quizContext.checking ||
                              quizContext.saved
                            }
                            onClick={() => selectAnswer(choice.id)}
                          >
                            <span className="pandai-attempt-radio" aria-hidden="true" />
                            <span className="pandai-attempt-choice__label">{choice.id}</span>
                            {isCorrectChoice ? (
                              <span
                                className="pandai-attempt-choice__mark pandai-attempt-choice__mark--correct"
                                aria-hidden="true"
                              >
                                ✓
                              </span>
                            ) : null}
                            {isWrongChoice ? (
                              <span
                                className="pandai-attempt-choice__mark pandai-attempt-choice__mark--wrong"
                                aria-hidden="true"
                              >
                                ✕
                              </span>
                            ) : null}
                          </button>
                        );
                      })}

                      {quizContext.saved ? (
                        <div
                          ref={
                            showAnyExplanationGuide || showVisibleContinueGuide
                              ? explanationGuideRef
                              : null
                          }
                          className={`pandai-attempt-explanation ${
                            isExplanationOpen ? "is-open" : ""
                          } ${showAnyExplanationGuide ? "is-guide-focus" : ""} ${
                            showVisibleContinueGuide ? "is-guide-open" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="pandai-attempt-explanation__toggle"
                            aria-expanded={isExplanationOpen}
                            disabled={
                              showWrongResultGuidePending ||
                              showProgressGuidePending ||
                              showWrongProgressBarGuide ||
                              showAnyContinueGuide
                            }
                            onClick={toggleExplanation}
                          >
                            <span>Explanation</span>
                            <span
                              className="pandai-attempt-explanation__chevron"
                              aria-hidden="true"
                            >
                              ⌄
                            </span>
                          </button>
                          {isExplanationOpen ? (
                            <div className="pandai-attempt-explanation__body">
                              <strong>Answer: {currentQuestion.correctOption}</strong>
                              <p>{currentQuestion.explanation || "Explanation will be added."}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>

                <div className="pandai-attempt-footer">
                  {quizContext.checking ? (
                    <span className="pandai-attempt-feedback">Thinking...</span>
                  ) : null}

                  {quizContext.saved ? (
                    <div className="pandai-attempt-footer__actions">
                      {showReviewPrevious ? (
                        <button
                          type="button"
                          className="pandai-previous-answer"
                          disabled={showQuizAttemptGuide}
                          onClick={previousReviewQuestion}
                        >
                          Previous
                        </button>
                      ) : null}

                      {showSubmitAnswer ? (
                        <button
                          ref={showVisibleContinueGuide ? continueGuideRef : null}
                          type="button"
                          className={`pandai-submit-answer ${
                            showAnyContinueGuide ? "is-guide-focus" : ""
                          }`}
                          disabled={showQuizCompletionModal || (showQuizAttemptGuide && !showAnyContinueGuide)}
                          onClick={submitQuizSet}
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          ref={showVisibleContinueGuide ? continueGuideRef : null}
                          type="button"
                          className={`pandai-next-answer ${
                            showAnyContinueGuide ? "is-guide-focus" : ""
                          }`}
                          disabled={showQuizAttemptGuide && !showAnyContinueGuide}
                          onClick={nextQuestion}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      ref={showSaveAnswerGuide ? saveGuideRef : null}
                      type="button"
                      className={`pandai-save-answer ${
                        showSaveAnswerGuide ? "is-guide-focus" : ""
                      }`}
                      disabled={
                        showQuestionReadGuide ||
                        showAnswerChoiceGuide ||
                        showGuidedAnswerGuide ||
                        !quizContext.selectedOption ||
                        quizContext.checking ||
                        quizContext.saved
                      }
                      onClick={saveAnswer}
                    >
                      Save Answer
                    </button>
                  )}
                </div>
                {quizContext.saved ? (
                  <div
                    className={`pandai-attempt-learning-note ${
                      quizContext.isCorrect ? "is-positive" : ""
                    }`}
                  >
                    {quizContext.isCorrect ? "Nice work" : "No worries, you are still learning!"}
                  </div>
                ) : null}
                {showSaveAnswerGuide ? (
                  <div
                    className="pandai-question-guide pandai-question-guide--save"
                    role="dialog"
                    aria-labelledby="pandai-save-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-save-guide-title">Tap here to check 🚀</h3>
                      <p>See if the answer is correct 👀</p>
                    </div>
                  </div>
                ) : null}
                {showWrongResultGuide ? (
                  <div
                    className="pandai-question-guide pandai-question-guide--wrong-result"
                    role="dialog"
                    aria-labelledby="pandai-wrong-result-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-wrong-result-guide-title">
                        Not this one 👀
                      </h3>
                      <p>We picked this one on purpose so you can see what happens next 👇</p>
                      <button
                        type="button"
                        className="pandai-question-guide__next"
                        onClick={advanceFromWrongResultGuide}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
                {showProgressBarGuide ? (
                  <div
                    className="pandai-question-guide pandai-question-guide--progress"
                    role="dialog"
                    aria-labelledby="pandai-progress-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-progress-guide-title">
                        {showFinalProgressBarCopy
                          ? "Nice job - your last question is correct! 🎉"
                          : `Nice job - your ${ordinalQuestionLabel} is correct! 🎉`}
                      </h3>
                      <p>
                        {showFinalProgressBarCopy
                          ? "This is your last question. The bar isn't full yet because of an earlier mistake 👇"
                          : `You're now on your ${ordinalQuestionLabel}. It grows as you answer correctly ✨`}
                      </p>
                      <button
                        type="button"
                        className="pandai-question-guide__next"
                        onClick={advanceFromProgressGuide}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
                {showWrongProgressBarGuide ? (
                  <div
                    className="pandai-question-guide pandai-question-guide--progress"
                    role="dialog"
                    aria-labelledby="pandai-wrong-progress-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-wrong-progress-guide-title">
                        {isFinalQuizQuestion
                          ? "This is your last question"
                          : `You're on your ${ordinalQuestionLabel}`}
                      </h3>
                      <p>
                        {isFinalQuizQuestion
                          ? "This is your last question, and the bar didn't go up because the answer was wrong ✨"
                          : "The bar didn't go up just now because the answer was wrong ✨"}
                      </p>
                      <button
                        type="button"
                        className="pandai-question-guide__next"
                        onClick={advanceFromWrongProgressGuide}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
                {showAnyExplanationGuide ? (
                  <div
                    className="pandai-question-guide pandai-question-guide--explanation"
                    role="dialog"
                    aria-labelledby="pandai-explanation-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-explanation-guide-title">
                        {showWrongExplanationGuide
                          ? `Let's check your ${ordinalQuestionLabel}`
                          : `${ordinalQuestionTitle}: learn more 📘`}
                      </h3>
                      <p>
                        {showWrongExplanationGuide
                          ? "to see what went wrong"
                          : "Tap to read the explanation 😊"}
                      </p>
                    </div>
                  </div>
                ) : null}
                {showVisibleContinueGuide ? (
                  <div
                    className={`pandai-question-guide ${
                      showSubmitAnswer
                        ? "pandai-question-guide--final-review"
                        : "pandai-question-guide--continue"
                    }`}
                    role="dialog"
                    aria-labelledby="pandai-continue-guide-title"
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-question-guide__mascot"
                    />
                    <div className="pandai-question-guide__bubble">
                      <h3 id="pandai-continue-guide-title">
                        {showSubmitAnswer
                          ? "Nice, that's correct! 🎉"
                          : `Your ${ordinalQuestionLabel} is done 👉`}
                      </h3>
                      <p>
                        {showSubmitAnswer
                          ? "You can read the explanation, review previous questions, and Submit Answer when you're ready 👉"
                          : "Tap Next to continue 🚀"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : (
            <section
              className={`pandai-quiz-workspace ${
                showChapterSelectionGuide ? "is-chapter-guided" : ""
              } ${showTopicStartGuide ? "is-topic-guided" : ""}`}
            >
              <aside className="pandai-quiz-left">
                <div className="pandai-quiz-card">
                  <div className="pandai-quiz-card__head">
                    <h3>Subject</h3>
                    <button
                      type="button"
                      className="pandai-link-btn"
                      disabled={showChapterSelectionGuide || showTopicStartGuide}
                      onClick={changeSubject}
                    >
                      Change subject
                    </button>
                  </div>
                  <div className="pandai-current-subject">
                    <span className="pandai-current-subject__icon">∂</span>
                    <span>{pageContext.selectedSubject}</span>
                  </div>
                </div>

                <div className="pandai-quiz-card">
                  <div className="pandai-quiz-card__head">
                    <h3>Report</h3>
                    <button
                      type="button"
                      className="pandai-link-btn"
                      onClick={openReportCard}
                    >
                      View more
                    </button>
                  </div>
                  <div className="pandai-report-list">
                    <div className="pandai-report-item">
                      <span>Progress</span>
                      <strong className="ok">SATISFACTORY</strong>
                    </div>
                    <div className="pandai-report-item">
                      <span>Score percentage</span>
                      <strong>54%</strong>
                    </div>
                    <div className="pandai-report-item">
                      <span>Score grade</span>
                      <strong>C</strong>
                    </div>
                    <div className="pandai-report-item">
                      <span>Question answered</span>
                      <strong>13</strong>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="pandai-quiz-center">
                {showChapterSelectionGuide || showTopicStartGuide ? (
                  <div
                    className={`pandai-chapter-guide ${
                      showTopicStartGuide ? "pandai-chapter-guide--topic" : ""
                    }`}
                    role="dialog"
                    aria-labelledby={activeGuideTitleId}
                  >
                    <img
                      src={pbotMascot}
                      alt=""
                      aria-hidden="true"
                      className="pandai-chapter-guide__mascot"
                    />
                    <div className="pandai-chapter-guide__bubble">
                      <h3 id={activeGuideTitleId}>{chapterGuideTitle}</h3>
                      <p>{chapterGuideBody}</p>
                    </div>
                  </div>
                ) : null}

                <div className="pandai-quiz-filter">Select Chapter</div>
                {isMathSelected && pageContext.selectedTopic ? (
                  <div className="pandai-topic-path">
                    Mathematics &gt; {pageContext.selectedTopic}
                  </div>
                ) : null}

                {isMathSelected ? (
                  <div
                    ref={topicPickerRef}
                    tabIndex={-1}
                    className={`pandai-chapter-list ${
                      uiContext.topicPickerHighlighted ? "is-guided" : ""
                    } ${showAppGuide ? "is-onboarding-guided" : ""}`}
                  >
                    {MATH_CHAPTERS.map((chapter) => {
                      const isGuideFocus =
                        showChapterSelectionGuide &&
                        chapter.id === FIRST_GUIDED_CHAPTER_ID;
                      const isGuideLocked = showChapterSelectionGuide && !isGuideFocus;
                      const isExpanded = expandedChapterId === chapter.id;
                      const isExpandable = Boolean(chapter.topics?.length);
                      const isExpandedFocus =
                        showTopicStartGuide &&
                        chapter.id === FIRST_GUIDED_CHAPTER_ID &&
                        isExpanded;

                      return (
                        <article
                          key={chapter.id}
                          ref={isGuideFocus ? chapterGuideCardRef : undefined}
                          className={`pandai-chapter-card ${
                            isExpanded ? "is-selected" : ""
                          } ${isGuideFocus ? "is-guide-focus" : ""} ${
                            isGuideLocked ? "is-guide-locked" : ""
                          } ${isExpandedFocus ? "is-expanded-focus" : ""} ${
                            !isExpandable ? "is-static" : ""
                          }`}
                          aria-disabled={isGuideLocked || undefined}
                        >
                          <button
                            type="button"
                            className="pandai-chapter-toggle"
                            disabled={isGuideLocked || isExpandedFocus}
                            aria-expanded={isExpandable ? isExpanded : undefined}
                            aria-controls={isExpandable ? `chapter-panel-${chapter.id}` : undefined}
                            aria-describedby={isGuideFocus ? activeGuideTitleId : undefined}
                            onClick={() => handleChapterToggle(chapter)}
                          >
                            <div className="pandai-chapter-icon">{chapter.icon}</div>
                            <div className="pandai-chapter-content">
                              <h4>{chapter.title}</h4>
                              <p>{chapter.subtitle}</p>
                            </div>
                            <span
                              className={`pandai-chapter-caret ${isExpanded ? "is-open" : ""}`}
                              aria-hidden="true"
                            >
                              ⌄
                            </span>
                          </button>

                          {isExpanded && isExpandable ? (
                            <div
                              id={`chapter-panel-${chapter.id}`}
                              className="pandai-chapter-panel"
                            >
                              <div className="pandai-topic-set-list">
                                {chapter.topics.map((topicItem, topicIndex) => {
                                  const isAvailable = topicItem.status === "available";
                                  const isTopicGuideFocus = showTopicStartGuide && topicIndex === 0;
                                  const isTopicGuideLocked =
                                    showTopicStartGuide && !isTopicGuideFocus;

                                  return (
                                    <div
                                      key={topicItem.id}
                                      ref={isTopicGuideFocus ? topicGuideRowRef : undefined}
                                      className={`pandai-topic-set-row ${
                                        isAvailable ? "is-available" : "is-locked"
                                      } ${isTopicGuideFocus ? "is-guide-focus" : ""} ${
                                        isTopicGuideLocked ? "is-guide-locked" : ""
                                      }`}
                                      aria-describedby={
                                        isTopicGuideFocus ? activeGuideTitleId : undefined
                                      }
                                    >
                                      <div className="pandai-topic-set-row__main">
                                        <span
                                          className="pandai-topic-set-row__index"
                                          aria-hidden="true"
                                        >
                                          {topicIndex + 1}
                                        </span>
                                        <span className="pandai-topic-set-row__label">
                                          {topicItem.label}
                                        </span>
                                      </div>

                                      {isAvailable ? (
                                        <button
                                          type="button"
                                          className="pandai-start-btn pandai-start-btn--compact"
                                          onClick={() => startTopicQuiz(topicItem.topic, 5)}
                                        >
                                          Start
                                        </button>
                                      ) : (
                                        <span className="pandai-topic-set-row__coin" aria-hidden="true">
                                          🪙
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pandai-quiz-card pandai-unsupported">
                    <h3>{pageContext.selectedSubject}</h3>
                    <p>
                      PBot prototype sekarang support Mathematics sahaja. Sila
                      pilih Mathematics untuk teruskan.
                    </p>
                    <button
                      type="button"
                      className="pandai-start-btn"
                      onClick={switchToMathematics}
                    >
                      Switch to Mathematics
                    </button>
                  </div>
                )}
              </div>

              <aside className="pandai-quiz-right">
                <div className="pandai-score-chips">
                  <span className="chip-score">🏅 5 Score</span>
                  <span className="chip-coins">🪙 1 Coins</span>
                  <span className="chip-streak">🔥 0 Streak</span>
                  <span className="chip-heart">❤ ∞</span>
                </div>

                <div className="pandai-quiz-card">
                  <div className="pandai-quiz-card__head">
                    <h3>Badges</h3>
                    <Link to={APP_PATHS.app}>View more</Link>
                  </div>
                  <div className="pandai-badge-item">
                    <div className="pandai-badge-title">STREAK</div>
                    <div className="pandai-badge-sub">9 days more to go</div>
                    <div className="pandai-badge-bar">
                      <span style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div className="pandai-badge-item">
                    <div className="pandai-badge-title">SCORE</div>
                    <div className="pandai-badge-sub">995 more points to go</div>
                    <div className="pandai-badge-bar">
                      <span style={{ width: "8%" }} />
                    </div>
                  </div>
                </div>

                <button type="button" className="pandai-back-classic">
                  Back to classic quiz
                </button>
              </aside>
            </section>
            )
          ) : showLearnView ? (
            <LearnPageView
              pageContext={pageContext}
              onOpenView={openLearnSubView}
              onGoPractice={goPracticeFromBookmarks}
            />
          ) : showMissionHubView ? (
            <MissionHubView selectedReward={selectedReward} missionContext={missionContext} />
          ) : showAchievementView ? (
            <AchievementView onOpenSubject={openSubjectAnalysis} />
          ) : showPracticeAnalysisView ? (
            <SubjectAnalysisView
              analysis={analysisData}
              onBackToReport={returnToReportCard}
              onOpenTopic={openTopicFromAnalysis}
            />
          ) : (
            <div className={`pandai-home-stage ${showHomeSubjectGuide ? "is-guided" : ""}`}>
              {showHomeSubjectGuide ? (
                <div className="pandai-home-guide" role="dialog" aria-labelledby="pandai-home-guide-title">
                  <img
                    src={pbotMascot}
                    alt=""
                    aria-hidden="true"
                    className="pandai-home-guide__mascot"
                  />
                  <div className="pandai-home-guide__bubble">
                    <h3 id="pandai-home-guide-title">Start with a subject</h3>
                    <p>Choose Mathematics from Home to begin your learning journey.</p>
                  </div>
                </div>
              ) : null}

              <section className="pandai-subject-grid">
                {SUBJECT_CARDS.map((card) => {
                  const isGuideFocus = showHomeSubjectGuide && card.subject === "Mathematics";
                  const isGuideLocked = showHomeSubjectGuide && !isGuideFocus;

                  return (
                    <article
                      key={card.id}
                      ref={isGuideFocus ? mathGuideCardRef : undefined}
                      className={`pandai-subject-card ${card.highlight ? "is-highlight" : ""} ${
                        pageContext.selectedSubject === card.subject ? "is-selected" : ""
                      } ${isGuideFocus ? "is-guide-focus" : ""} ${
                        isGuideLocked ? "is-guide-locked" : ""
                      }`}
                      role="button"
                      tabIndex={isGuideLocked ? -1 : 0}
                      aria-label={`Pilih subjek ${card.subject}`}
                      aria-disabled={isGuideLocked || undefined}
                      aria-describedby={isGuideFocus ? "pandai-home-guide-title" : undefined}
                      onClick={() => selectSubject(card.subject)}
                      onKeyDown={(event) =>
                        handleCardKey(event, () => selectSubject(card.subject))
                      }
                    >
                    <div className={`pandai-thumb tone-${card.thumbTone}`}>
                      <span>{card.icon}</span>
                    </div>

                    <div className="pandai-subject-card__content">
                      <div className="pandai-subject-card__head">
                        <span className={`pandai-tag tone-${card.tagTone}`}>
                          {card.subject}
                        </span>
                      </div>
                      <h3>{card.topic}</h3>
                      <p>{card.description}</p>
                    </div>
                    </article>
                  );
                })}
              </section>

              <section className="pandai-recent">
                <div className="pandai-section-title">
                  <h2>Your Recent Activities</h2>
                  <Link to={APP_PATHS.app}>View activity history</Link>
                </div>

                <div className="pandai-recent-grid">
                  {RECENT_ACTIVITIES.map((item) => (
                    <article
                      key={item.id}
                      className="pandai-recent-card"
                      role="button"
                      tabIndex={0}
                      aria-label={`Sambung aktiviti ${item.title}`}
                      onClick={() => openRecentActivity(item)}
                      onKeyDown={(event) =>
                        handleCardKey(event, () => openRecentActivity(item))
                      }
                    >
                      <div className="pandai-recent-card__thumb" />
                      <div className="pandai-recent-card__text">
                        <div className="pandai-recent-card__meta">
                          <span className="pill pill-subject">{item.subject}</span>
                          <span className="pill pill-mode">{item.mode}</span>
                        </div>
                        <h4>{item.title}</h4>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="pandai-footer">
          <div>
            <span className="muted">Copyright 2026 </span>
            <Link to={APP_PATHS.app}>Pandai.org</Link>
            <span className="muted"> All Rights Reserved</span>
          </div>
          <div className="muted">Made with love in Malaysia</div>
        </footer>
      </div>
      {showQuizCompletionModal ? (
        <div className="pandai-quiz-completion" role="presentation">
          <div className="pandai-quiz-completion__scrim" aria-hidden="true" />
          <div className="pandai-quiz-completion__stage">
            <div
              className="pandai-quiz-completion__coach"
              role="note"
              aria-labelledby="pandai-quiz-completion-coach-title"
            >
              <img
                src={pbotMascot}
                alt=""
                aria-hidden="true"
                className="pandai-question-guide__mascot pandai-quiz-completion__coach-mascot"
              />
              <div className="pandai-question-guide__bubble pandai-quiz-completion__coach-bubble">
                <h3 id="pandai-quiz-completion-coach-title">{completionCoachTitle}</h3>
                <p>{completionCoachSummary}</p>
                <p className="pandai-quiz-completion__coach-rewards">{completionCoachRewardLine}</p>
                <p className="pandai-quiz-completion__coach-prompt">{completionCoachPrompt}</p>
              </div>
            </div>

            <div
              className="pandai-quiz-completion__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pandai-quiz-completion-title"
            >
              <button
                type="button"
                className="pandai-quiz-completion__close"
                aria-label="Close quiz completion summary"
                disabled
              >
                ×
              </button>

              <div className="pandai-quiz-completion__stars" aria-hidden="true">
                {QUIZ_STAR_THRESHOLDS.map((threshold) => (
                  <span
                    key={threshold}
                    className={`pandai-quiz-completion__star ${
                      progressTrackPercent >= threshold ? "is-active" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <img
                src={pbotMascot}
                alt=""
                aria-hidden="true"
                className="pandai-quiz-completion__mascot"
              />

              <h2 id="pandai-quiz-completion-title">{completionHeading}</h2>
              <p className="pandai-quiz-completion__message">{completionMessage}</p>

              <div className="pandai-quiz-completion__stats" aria-label="Quiz summary">
                <div className="pandai-quiz-completion__stat">
                  <span className="pandai-quiz-completion__stat-icon" aria-hidden="true">
                    🏅
                  </span>
                  <strong>+ {quizContext.correctCount}</strong>
                </div>
                <div className="pandai-quiz-completion__stat">
                  <span className="pandai-quiz-completion__stat-icon" aria-hidden="true">
                    🪙
                  </span>
                  <strong>+ {completionCoinReward}</strong>
                </div>
                <div className="pandai-quiz-completion__stat is-negative">
                  <span className="pandai-quiz-completion__stat-icon" aria-hidden="true">
                    ❤
                  </span>
                  <strong>{completionHeartDelta}</strong>
                </div>
              </div>

              <div className="pandai-quiz-completion__actions">
                <button
                  type="button"
                  className="pandai-quiz-completion__btn pandai-quiz-completion__btn--ghost"
                  disabled
                  onClick={startNextTopicQuiz}
                >
                  Next topic {nextTopic ? "🪙" : ""}
                </button>
                <button
                  type="button"
                  className="pandai-quiz-completion__btn pandai-quiz-completion__btn--solid is-guide-focus"
                  autoFocus
                  onClick={practiceNewSet}
                >
                  Practise new set
                </button>
              </div>

              <p className="pandai-quiz-completion__note">
                {submittedOnLabel
                  ? `Submitted on ${submittedOnLabel} • ${quizContext.correctCount} correct • ${incorrectCount} incorrect • ${scorePercent}%`
                  : `${quizContext.correctCount} correct • ${incorrectCount} incorrect • ${scorePercent}%`}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function App() {
  const [onboardingProfile, setOnboardingProfile] = useState(createEmptyOnboardingProfile);
  const [onboardingSessionId] = useState(createOnboardingSessionId);

  return (
    <Routes>
      <Route
        path={APP_PATHS.onboarding}
        element={
          <PrototypeOnboardingPage
            onboardingProfile={onboardingProfile}
            setOnboardingProfile={setOnboardingProfile}
          />
        }
      />
      <Route
        path={APP_PATHS.onboardingName}
        element={
          <PrototypeNamePage
            onboardingProfile={onboardingProfile}
            onboardingSessionId={onboardingSessionId}
            setOnboardingProfile={setOnboardingProfile}
          />
        }
      />
      <Route
        path={APP_PATHS.onboardingReward}
        element={
          <PrototypeRewardPage
            onboardingProfile={onboardingProfile}
            setOnboardingProfile={setOnboardingProfile}
          />
        }
      />
      <Route
        path={APP_PATHS.onboardingMission}
        element={<PrototypeMissionPage onboardingProfile={onboardingProfile} />}
      />
      <Route
        path={`${APP_PATHS.app}/*`}
        element={<PrototypeAppPage onboardingProfile={onboardingProfile} />}
      />
      {LEGACY_PATH_REDIRECTS.map((route) => (
        <Route
          key={route.from}
          path={route.from}
          element={<Navigate to={route.to} replace />}
        />
      ))}
      <Route path="*" element={<Navigate to={APP_PATHS.onboarding} replace />} />
    </Routes>
  );
}
