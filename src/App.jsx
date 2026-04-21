import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PBotWidget from "./pbot/PBotWidget";
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
  persistLearnerName,
  persistSelectedReward,
  persistPreferredLanguage,
  readLearnerName,
  readSelectedReward,
  readPreferredLanguage,
} from "./onboarding/profileStorage";
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
  { id: "rewards", label: "Rewards" },
];

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

          <button type="button" className="pandai-onboarding-cta" onClick={onContinue}>
            Start Learning Now
          </button>
        </section>
      </div>
    </div>
  );
}

function WelcomeNameScreen({ learnerName, onNameChange, onPickSuggestion, onContinue }) {
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

          <form className="pandai-name-form" onSubmit={onContinue}>
            <label className="pandai-visually-hidden" htmlFor="learner-name">
              Student name
            </label>
            <input
              id="learner-name"
              type="text"
              className="pandai-name-input"
              placeholder="Type your name"
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
            <h1 id="pandai-mission-title">Let&apos;s get your reward faster 🚀</h1>
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

function PrototypeOnboardingPage() {
  const navigate = useNavigate();
  const [preferredLanguage, setPreferredLanguage] = useState(() => readPreferredLanguage());

  function handleSelectLanguage(language) {
    setPreferredLanguage(language);
    persistPreferredLanguage(language);
  }

  function handleContinue() {
    persistPreferredLanguage(preferredLanguage);
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

function PrototypeNamePage() {
  const navigate = useNavigate();
  const [learnerName, setLearnerName] = useState(() => readLearnerName());

  function handleContinue(event) {
    event.preventDefault();
    const normalizedName = normalizeLearnerName(learnerName);
    if (!normalizedName) {
      return;
    }

    persistLearnerName(normalizedName);
    navigate(APP_PATHS.onboardingReward, { replace: true });
  }

  function handleNameChange(nextName) {
    setLearnerName(nextName);
  }

  function handlePickSuggestion(nextName) {
    setLearnerName(nextName);
  }

  return (
    <WelcomeNameScreen
      learnerName={learnerName}
      onNameChange={handleNameChange}
      onPickSuggestion={handlePickSuggestion}
      onContinue={handleContinue}
    />
  );
}

function PrototypeRewardPage() {
  const navigate = useNavigate();
  const learnerName = readLearnerName();
  const normalizedLearnerName = normalizeLearnerName(learnerName);
  const [selectedReward, setSelectedReward] = useState(() =>
    readSelectedReward(REWARD_OPTIONS[1]?.id || REWARD_OPTIONS[0]?.id),
  );

  if (!normalizedLearnerName) {
    return <Navigate to={APP_PATHS.onboardingName} replace />;
  }

  function handleSelectReward(rewardId) {
    setSelectedReward(rewardId);
    persistSelectedReward(rewardId);
  }

  function handleContinue() {
    persistSelectedReward(selectedReward);
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

function PrototypeMissionPage() {
  const navigate = useNavigate();
  const learnerName = readLearnerName();
  const normalizedLearnerName = normalizeLearnerName(learnerName);
  const selectedReward = readSelectedReward(REWARD_OPTIONS[1]?.id || REWARD_OPTIONS[0]?.id);

  if (!normalizedLearnerName) {
    return <Navigate to={APP_PATHS.onboardingName} replace />;
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

function PrototypeAppPage() {
  return (
    <PBotContextProvider>
      <AppShell />
    </PBotContextProvider>
  );
}

function handleCardKey(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function AppShell() {
  const location = useLocation();
  const { userContext, pageContext, quizContext, uiContext, actions } = usePBotContext();
  const topicPickerRef = useRef(null);
  const learnMenuRef = useRef(null);
  const mathGuideCardRef = useRef(null);
  const [analysisSubjectId, setAnalysisSubjectId] = useState("kssm-am");
  const [learnMenuOpen, setLearnMenuOpen] = useState(false);
  const [dismissedGuideKeys, setDismissedGuideKeys] = useState([]);
  const hasSelectedSubject = Boolean(pageContext.selectedSubject);
  const showQuizWorkspace = pageContext.route === "quiz" && hasSelectedSubject;
  const isMathSelected = pageContext.selectedSubject === "Mathematics";
  const showQuizAttempt = showQuizWorkspace && isMathSelected && quizContext.inProgress;
  const analysisData = useMemo(
    () => SUBJECT_ANALYSIS_BY_ID[analysisSubjectId] || SUBJECT_ANALYSIS_BY_ID["kssm-am"],
    [analysisSubjectId],
  );
  const showAchievementView = pageContext.route === "achievement";
  const showLearnView = pageContext.route === "learn";
  const showPracticeAnalysisView = pageContext.route === "practice" && Boolean(analysisData);
  const currentQuestion = quizContext.currentQuestion;
  const questionProgress = `${quizContext.currentIndex + 1} / ${quizContext.total}`;
  const learnerName = getLearnerDisplayName(userContext.name);
  const learnerInitial = getLearnerInitial(userContext.name);
  const homeGuideKey = location.state?.showHomeGuide ? location.key : null;
  const showHomeSubjectGuide =
    Boolean(homeGuideKey) &&
    !dismissedGuideKeys.includes(homeGuideKey) &&
    pageContext.route === "home" &&
    !pageContext.selectedSubject;

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

  function dismissHomeGuide() {
    if (!homeGuideKey) {
      return;
    }

    setDismissedGuideKeys((prev) =>
      prev.includes(homeGuideKey) ? prev : [...prev, homeGuideKey],
    );
  }

  function selectSubject(subject) {
    dismissHomeGuide();
    actions.setSelectedSubject(subject);
    actions.clearTopic();
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function openRecentActivity(activity) {
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
    const reportRow = REPORT_CARD_SUMMARY.find((row) => row.id === subjectId);
    setAnalysisSubjectId(subjectId);
    actions.setSelectedSubject(reportRow?.subject || null);
    actions.clearTopic();
    actions.setRoute("practice");
    actions.stopQuiz();
  }

  function openReportCard() {
    actions.setRoute("achievement");
    actions.stopQuiz();
  }

  function openLearnSubView(view, options = {}) {
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
    actions.setRoute("practice");
    if (!pageContext.selectedSubject) {
      actions.setSelectedSubject("Mathematics");
      actions.setSelectedTopic("Functions");
    }
    actions.stopQuiz();
  }

  function returnToReportCard() {
    actions.setRoute("achievement");
    actions.stopQuiz();
  }

  function openTopicFromAnalysis(topic) {
    actions.setSelectedSubject("Mathematics");
    actions.setSelectedTopic(topic);
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function changeSubject() {
    actions.setSelectedSubject(null);
    actions.clearTopic();
    actions.setRoute("home");
    actions.stopQuiz();
  }

  function switchToMathematics() {
    actions.setSelectedSubject("Mathematics");
    actions.clearTopic();
    actions.setRoute("quiz");
    actions.stopQuiz();
  }

  function startTopicQuiz(topic) {
    actions.startQuiz({ topic, total: 5 });
  }

  function backToChapters() {
    actions.stopQuiz();
  }

  function saveAnswer() {
    actions.saveQuizAnswer();
  }

  function nextQuestion() {
    actions.nextQuizQuestion();
  }

  function selectAnswer(optionId) {
    if (quizContext.eliminatedOptions.includes(optionId)) {
      return;
    }
    actions.selectQuizOption(optionId);
  }

  function openPBotPanel() {
    window.dispatchEvent(new Event("pbot:open"));
  }

  function handleMenuSelect(route) {
    setLearnMenuOpen(false);
    if (route !== "home") {
      dismissHomeGuide();
    }
    actions.setRoute(route);
    if (route === "home") {
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
          <section className="pandai-menu">
            {TOP_MENU.map((item) => (
              item.id === "learn" ? (
                <div key={item.id} className="pandai-menu__dropdown" ref={learnMenuRef}>
                  <button
                    type="button"
                    className={`pandai-menu__item ${
                      pageContext.route === item.id ? "is-active" : ""
                    } ${learnMenuOpen ? "is-open" : ""}`}
                    aria-haspopup="menu"
                    aria-expanded={learnMenuOpen}
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
                  }`}
                  onClick={() => handleMenuSelect(item.id)}
                >
                  <span className="pandai-menu__dot" aria-hidden="true" />
                  {item.label}
                </button>
              )
            ))}
          </section>

          {showQuizWorkspace ? (
            showQuizAttempt ? (
              <section className="pandai-quiz-attempt">
                <div className="pandai-attempt-top">
                  <div className="pandai-attempt-subject">
                    <button
                      type="button"
                      className="pandai-attempt-back"
                      aria-label="Back to chapter list"
                      onClick={backToChapters}
                    >
                      ←
                    </button>
                    <span className="pandai-current-subject__icon">∂</span>
                    <strong>Mathematics</strong>
                  </div>

                  <div className="pandai-attempt-track" aria-hidden="true">
                    <span className="pandai-attempt-track__star is-filled">★</span>
                    <span className="pandai-attempt-track__star">★</span>
                    <span className="pandai-attempt-track__star">★</span>
                  </div>

                  <button
                    type="button"
                    className="pandai-ask-pbot-btn"
                    onClick={openPBotPanel}
                  >
                    Ask PBot
                    <img src={pbotMascot} alt="" aria-hidden="true" />
                  </button>
                </div>

                <article className="pandai-attempt-card">
                  <header className="pandai-attempt-card__header">
                    <h2>{currentQuestion.title}</h2>
                    <div className="pandai-attempt-counter">
                      <span aria-hidden="true">▲</span> {questionProgress}
                    </div>
                  </header>

                  <div className="pandai-attempt-grid">
                    <div className="pandai-attempt-question">
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

                    <div className="pandai-attempt-choice-list">
                      {currentQuestion.options.map((choice) => {
                        const isSelected = quizContext.selectedOption === choice.id;
                        const isEliminated =
                          quizContext.eliminatedOptions.includes(choice.id) && !isSelected;
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
                            type="button"
                            className={`pandai-attempt-choice ${
                              isSelected ? "is-selected" : ""
                            } ${isEliminated ? "is-eliminated" : ""} ${
                              isCorrectChoice ? "is-correct" : ""
                            } ${isWrongChoice ? "is-wrong" : ""}`}
                            disabled={
                              isEliminated || quizContext.checking || quizContext.saved
                            }
                            onClick={() => selectAnswer(choice.id)}
                          >
                            <span className="pandai-attempt-radio" aria-hidden="true" />
                            {choice.id}
                            {isCorrectChoice ? (
                              <span className="pandai-attempt-choice__mark">✓</span>
                            ) : null}
                            {isWrongChoice ? (
                              <span className="pandai-attempt-choice__mark">✕</span>
                            ) : null}
                          </button>
                        );
                      })}

                      {quizContext.saved ? (
                        <div className="pandai-attempt-explanation">
                          <div className="pandai-attempt-explanation__head">Explanation</div>
                          <div className="pandai-attempt-explanation__body">
                            <strong>Answer: {currentQuestion.correctOption}</strong>
                            <p>{currentQuestion.explanation || "Explanation will be added."}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>

                <div className="pandai-attempt-footer">
                  {quizContext.checking ? (
                    <span className="pandai-attempt-feedback">Thinking...</span>
                  ) : quizContext.saved ? (
                    <span
                      className={`pandai-attempt-feedback ${
                        quizContext.isCorrect ? "is-correct" : "is-wrong"
                      }`}
                    >
                      {quizContext.isCorrect
                        ? "Nice ✅ Jawapan direkod."
                        : "Jawapan salah direkod. Rujuk explanation."}
                    </span>
                  ) : null}

                  {quizContext.saved ? (
                    <button
                      type="button"
                      className="pandai-next-answer"
                      onClick={nextQuestion}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pandai-save-answer"
                      disabled={
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
                {quizContext.saved && !quizContext.isCorrect ? (
                  <div className="pandai-attempt-learning-note">
                    No worries, you are still learning!
                  </div>
                ) : null}
              </section>
            ) : (
            <section className="pandai-quiz-workspace">
              <aside className="pandai-quiz-left">
                <div className="pandai-quiz-card">
                  <div className="pandai-quiz-card__head">
                    <h3>Subject</h3>
                    <button
                      type="button"
                      className="pandai-link-btn"
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
                    }`}
                  >
                    {MATH_CHAPTERS.map((chapter, index) => (
                      <article
                        key={chapter.id}
                        className={`pandai-chapter-card ${
                          pageContext.selectedTopic === chapter.topic ? "is-selected" : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => actions.setSelectedTopic(chapter.topic)}
                        onKeyDown={(event) =>
                          handleCardKey(event, () =>
                            actions.setSelectedTopic(chapter.topic),
                          )
                        }
                      >
                        <div className="pandai-chapter-icon">{chapter.icon}</div>
                        <div className="pandai-chapter-content">
                          <h4>{chapter.title}</h4>
                          <p>{chapter.subtitle}</p>
                        </div>
                        {pageContext.selectedTopic === chapter.topic ? (
                          <span className="pandai-chapter-selected">✓</span>
                        ) : index === 0 ? (
                          <button
                            type="button"
                            className="pandai-start-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              startTopicQuiz(chapter.topic);
                            }}
                          >
                            Start
                          </button>
                        ) : (
                          <span className="pandai-chapter-caret">⌄</span>
                        )}
                      </article>
                    ))}
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
                    <button
                      type="button"
                      className="pandai-home-guide__dismiss"
                      aria-label="Dismiss guide"
                      onClick={dismissHomeGuide}
                    >
                      ×
                    </button>
                    <h3 id="pandai-home-guide-title">Start with a subject</h3>
                    <p>Choose Mathematics from Home to begin your learning journey.</p>
                  </div>
                </div>
              ) : null}

              <section className="pandai-subject-grid">
                {SUBJECT_CARDS.map((card) => (
                  <article
                    key={card.id}
                    ref={
                      showHomeSubjectGuide && card.subject === "Mathematics"
                        ? mathGuideCardRef
                        : undefined
                    }
                    className={`pandai-subject-card ${card.highlight ? "is-highlight" : ""} ${
                      pageContext.selectedSubject === card.subject ? "is-selected" : ""
                    } ${showHomeSubjectGuide && card.subject === "Mathematics" ? "is-guide-focus" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Pilih subjek ${card.subject}`}
                    aria-describedby={
                      showHomeSubjectGuide && card.subject === "Mathematics"
                        ? "pandai-home-guide-title"
                        : undefined
                    }
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
                ))}
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

      <PBotWidget />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path={APP_PATHS.onboarding} element={<PrototypeOnboardingPage />} />
      <Route path={APP_PATHS.onboardingName} element={<PrototypeNamePage />} />
      <Route path={APP_PATHS.onboardingReward} element={<PrototypeRewardPage />} />
      <Route path={APP_PATHS.onboardingMission} element={<PrototypeMissionPage />} />
      <Route path={`${APP_PATHS.app}/*`} element={<PrototypeAppPage />} />
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
