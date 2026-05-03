export const LANGUAGE_OPTIONS = [
  { id: "ms", label: "Bahasa Melayu" },
  { id: "en", label: "English" },
  { id: "zh", label: "Chinese" },
];

export const LOCKED_REWARD_PREVIEWS = [
  { id: "roblox", brand: "ROBLOX", label: "300 Robux" },
  { id: "shopee", brand: "Shopee", label: "RM20 Shopee" },
  { id: "mlbb", brand: "MLBB", label: "RM20 Game Credits" },
];

export const REWARD_OPTIONS = [
  {
    id: "tng",
    brand: "Touch 'n Go",
    label: "RM5 TnG",
    cost: 120,
    icon: "TnG",
  },
  {
    id: "tealive",
    brand: "Tealive",
    label: "RM5 Tealive",
    cost: 120,
    icon: "Tea",
    tag: "Popular",
  },
  {
    id: "mixue",
    brand: "Mixue",
    label: "RM5 Mixue",
    cost: 120,
    icon: "MX",
  },
];

const DEFAULT_NAME_SUGGESTIONS = ["Aiman", "Aim", "Man", "TopScorer"];
const PREFERRED_LANGUAGE_STORAGE_KEY = "pbot:preferred-language";
const LEARNER_NAME_STORAGE_KEY = "pbot:learner-name";
const SELECTED_REWARD_STORAGE_KEY = "pbot:selected-reward";
const MILESTONE2_POST_REVIEW_GUIDE_STORAGE_KEY = "pbot:milestone2-post-review-guide-complete";
const MILESTONE3_TOPIC_GUIDE_STORAGE_KEY = "pbot:milestone3-topic-guide-complete";

function resolveLanguageId(value, fallback = "en") {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "ms" || normalized === "bm" || normalized === "bahasa melayu") {
    return "ms";
  }

  if (normalized === "zh" || normalized === "cn" || normalized === "chinese") {
    return "zh";
  }

  if (normalized === "en" || normalized === "english") {
    return "en";
  }

  return resolveLanguageId(fallback, "en");
}

export function resolveLanguageLabel(value, fallback = "en") {
  const resolvedId = resolveLanguageId(value, fallback);
  return LANGUAGE_OPTIONS.find((option) => option.id === resolvedId)?.label || "English";
}

export function readPreferredLanguage(fallback = "en") {
  try {
    return resolveLanguageId(window.localStorage.getItem(PREFERRED_LANGUAGE_STORAGE_KEY), fallback);
  } catch {
    return resolveLanguageId(fallback, "en");
  }
}

export function persistPreferredLanguage(language) {
  const resolvedId = resolveLanguageId(language);

  try {
    window.localStorage.setItem(PREFERRED_LANGUAGE_STORAGE_KEY, resolvedId);
  } catch {
    // Ignore storage failures for prototype mode.
  }
}

export function normalizeLearnerName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").slice(0, 32);
}

export function readLearnerName(fallback = "") {
  try {
    const storedName = normalizeLearnerName(window.localStorage.getItem(LEARNER_NAME_STORAGE_KEY));
    return storedName || normalizeLearnerName(fallback);
  } catch {
    return normalizeLearnerName(fallback);
  }
}

export function persistLearnerName(name) {
  const normalizedName = normalizeLearnerName(name);

  if (!normalizedName) {
    return;
  }

  try {
    window.localStorage.setItem(LEARNER_NAME_STORAGE_KEY, normalizedName);
  } catch {
    // Ignore storage failures for prototype mode.
  }
}

export function buildNameSuggestions(name) {
  const normalizedName = normalizeLearnerName(name);

  if (!normalizedName) {
    return DEFAULT_NAME_SUGGESTIONS;
  }

  const compactName = normalizedName.replace(/\s+/g, "");
  const leadingShort = compactName.slice(0, Math.min(3, compactName.length));
  const trailingShort = compactName.slice(-Math.min(3, compactName.length));

  return Array.from(
    new Set([
      normalizedName,
      leadingShort && leadingShort !== normalizedName ? leadingShort : null,
      trailingShort &&
      trailingShort !== normalizedName &&
      trailingShort !== leadingShort
        ? trailingShort
        : null,
      "TopScorer",
    ].filter(Boolean)),
  );
}

export function getLearnerDisplayName(name, fallback = "Learner") {
  return normalizeLearnerName(name) || fallback;
}

export function getLearnerInitial(name, fallback = "L") {
  const displayName = getLearnerDisplayName(name, fallback);
  return displayName.charAt(0).toUpperCase();
}

function resolveRewardId(value, fallback = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (REWARD_OPTIONS.some((option) => option.id === normalized)) {
    return normalized;
  }

  return fallback;
}

export function readSelectedReward(fallback) {
  try {
    return resolveRewardId(
      window.localStorage.getItem(SELECTED_REWARD_STORAGE_KEY),
      resolveRewardId(fallback),
    );
  } catch {
    return resolveRewardId(fallback);
  }
}

export function persistSelectedReward(rewardId) {
  const resolvedId = resolveRewardId(rewardId);

  if (!resolvedId) {
    return;
  }

  try {
    window.localStorage.setItem(SELECTED_REWARD_STORAGE_KEY, resolvedId);
  } catch {
    // Ignore storage failures for prototype mode.
  }
}

export function clearOnboardingProfileStorage() {
  try {
    window.localStorage.removeItem(PREFERRED_LANGUAGE_STORAGE_KEY);
    window.localStorage.removeItem(LEARNER_NAME_STORAGE_KEY);
    window.localStorage.removeItem(SELECTED_REWARD_STORAGE_KEY);
    window.localStorage.removeItem(MILESTONE2_POST_REVIEW_GUIDE_STORAGE_KEY);
    window.localStorage.removeItem(MILESTONE3_TOPIC_GUIDE_STORAGE_KEY);
  } catch {
    // Ignore storage failures for prototype mode.
  }
}

export function readMilestone2PostReviewGuideComplete(fallback = false) {
  try {
    return window.localStorage.getItem(MILESTONE2_POST_REVIEW_GUIDE_STORAGE_KEY) === "true";
  } catch {
    return Boolean(fallback);
  }
}

export function persistMilestone2PostReviewGuideComplete(value = true) {
  try {
    window.localStorage.setItem(
      MILESTONE2_POST_REVIEW_GUIDE_STORAGE_KEY,
      value ? "true" : "false",
    );
  } catch {
    // Ignore storage failures for prototype mode.
  }
}

export function readMilestone3TopicGuideComplete(fallback = false) {
  try {
    return window.localStorage.getItem(MILESTONE3_TOPIC_GUIDE_STORAGE_KEY) === "true";
  } catch {
    return Boolean(fallback);
  }
}

export function persistMilestone3TopicGuideComplete(value = true) {
  try {
    window.localStorage.setItem(MILESTONE3_TOPIC_GUIDE_STORAGE_KEY, value ? "true" : "false");
  } catch {
    // Ignore storage failures for prototype mode.
  }
}
