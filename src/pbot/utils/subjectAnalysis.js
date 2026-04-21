function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePercent(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (match) {
    return toNumber(match[1]);
  }
  return toNumber(text.replace(/[^\d.-]/g, ""));
}

function parseCount(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  const match = text.match(/(\d+)/);
  return match ? toNumber(match[1]) : null;
}

function normalizeStatus(status) {
  const text = String(status || "").trim();
  if (!text) {
    return "Not started";
  }
  return text;
}

function normalizeTopic(rawTopic, index = 0) {
  return {
    chapter: toNumber(rawTopic.chapter) ?? index + 1,
    topicName: String(rawTopic.topicName || rawTopic.topic || `Topic ${index + 1}`).trim(),
    topicUrl: String(rawTopic.topicUrl || rawTopic.url || "#").trim(),
    scorePercent:
      rawTopic.scorePercent === null || rawTopic.scorePercent === undefined
        ? parsePercent(rawTopic.score)
        : parsePercent(rawTopic.scorePercent),
    status: normalizeStatus(rawTopic.status),
  };
}

function normalizeAnalysis(raw, fallback) {
  const topics = Array.isArray(raw.topics) ? raw.topics.map(normalizeTopic) : [];

  return {
    level: raw.level || fallback.level,
    subjectKey: raw.subjectKey || fallback.subjectKey,
    subjectName: raw.subjectName || fallback.subjectName,
    grade: raw.grade || null,
    scorePercent:
      raw.scorePercent === null || raw.scorePercent === undefined
        ? parsePercent(raw.score)
        : parsePercent(raw.scorePercent),
    label: raw.label || raw.performanceLabel || null,
    questionsAnswered: parseCount(raw.questionsAnswered),
    setsSubmitted: parseCount(raw.setsSubmitted),
    difficulty: {
      easy: parsePercent(raw.difficulty?.easy),
      medium: parsePercent(raw.difficulty?.medium),
      hard: parsePercent(raw.difficulty?.hard),
    },
    thinkingSkills: {
      lots: parsePercent(raw.thinkingSkills?.lots),
      mots: parsePercent(raw.thinkingSkills?.mots),
      hots: parsePercent(raw.thinkingSkills?.hots),
      mediumOrder: parsePercent(raw.thinkingSkills?.mediumOrder),
    },
    topics,
  };
}

function getPageText(doc) {
  return (doc?.body?.textContent || "").replace(/\s+/g, " ").trim();
}

function findPercentInText(text, pattern) {
  const regex = new RegExp(`${pattern.source}[^\\d]*(\\d{1,3}(?:\\.\\d+)?)\\s*%`, "i");
  const match = text.match(regex);
  return match ? toNumber(match[1]) : null;
}

function findCountInText(text, pattern) {
  const regex = new RegExp(`${pattern.source}[^\\d]*(\\d+)`, "i");
  const match = text.match(regex);
  return match ? toNumber(match[1]) : null;
}

function parseHeaderSummary(doc, fallback) {
  const text = getPageText(doc);
  const gradeMatch = text.match(/\b([A-F](?:\+|-)?)(?=\s|$)/);
  const labelMatch = text.match(
    /\b(CEMERLANG|MEMUASKAN|BAIK|LEMAH|EXCELLENT|SATISFACTORY|GOOD)\b/i,
  );

  return {
    subjectName:
      doc.querySelector("h1, .subject-title, .page-title")?.textContent?.trim() ||
      fallback.subjectName,
    grade: gradeMatch ? gradeMatch[1] : null,
    scorePercent:
      findPercentInText(text, /score\s*percentage|score|markah/) ||
      findPercentInText(text, /performance/) ||
      null,
    label: labelMatch ? labelMatch[1].toUpperCase() : null,
    questionsAnswered: findCountInText(text, /questions?\s*answered/) || null,
    setsSubmitted: findCountInText(text, /sets?\s*submitted/) || null,
  };
}

function parseDifficultyAndThinking(doc) {
  const text = getPageText(doc);

  const difficulty = {
    easy: findPercentInText(text, /easy/),
    medium: findPercentInText(text, /medium/),
    hard: findPercentInText(text, /hard/),
  };

  const thinkingSkills = {
    lots: findPercentInText(text, /lots/),
    mots: findPercentInText(text, /mots/),
    hots: findPercentInText(text, /hots/),
    mediumOrder:
      findPercentInText(text, /medium\s*order/) ||
      findPercentInText(text, /thinking\s*skills?\s*medium/),
  };

  return { difficulty, thinkingSkills };
}

function parseTopicsTable(doc) {
  const tables = Array.from(doc.querySelectorAll("table"));
  const table = tables.find((candidate) => {
    const head = candidate.querySelector("thead")?.textContent || candidate.textContent || "";
    return /chapter/i.test(head) && /topic/i.test(head);
  });

  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tbody tr, tr")).filter((row) =>
    row.querySelector("td"),
  );

  return rows
    .map((row, index) => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 2) {
        return null;
      }

      const chapter = parseCount(cells[0]?.textContent) ?? index + 1;
      const topicAnchor = cells[1]?.querySelector("a");
      const topicName = topicAnchor?.textContent?.trim() || cells[1]?.textContent?.trim();
      const topicUrl = topicAnchor?.getAttribute("href") || "#";
      const scorePercent = parsePercent(cells[2]?.textContent ?? null);
      const status = normalizeStatus(cells[3]?.textContent);

      return normalizeTopic(
        {
          chapter,
          topicName,
          topicUrl,
          scorePercent,
          status,
        },
        index,
      );
    })
    .filter(Boolean);
}

export function parseSubjectAnalysisHtml(html, level, subjectKey, subjectName) {
  if (typeof DOMParser === "undefined") {
    throw new Error("DOMParser unavailable in this environment.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const fallback = { level, subjectKey, subjectName };
  const header = parseHeaderSummary(doc, fallback);
  const breakdown = parseDifficultyAndThinking(doc);
  const topics = parseTopicsTable(doc);

  return normalizeAnalysis(
    {
      ...fallback,
      ...header,
      ...breakdown,
      topics,
    },
    fallback,
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toLevelKey(levelLabel = "KSSM F4") {
  const text = String(levelLabel || "")
    .toLowerCase()
    .trim();
  const match = text.match(/kssm\s*f(\d)/i);
  if (match) {
    return `kssm-f${match[1]}`;
  }
  return "kssm-f4";
}

const SUBJECT_MAP = {
  Mathematics: { subjectKey: "kssm-m", subjectName: "Mathematics" },
  "Additional Mathematics": {
    subjectKey: "kssm-am",
    subjectName: "Additional Mathematics",
  },
  Science: { subjectKey: "kssm-sc", subjectName: "Science" },
};

export function resolveSubjectMeta({ subjectName, levelLabel }) {
  const mapped = SUBJECT_MAP[subjectName] || {
    subjectKey: `kssm-${slugify(subjectName)}`,
    subjectName,
  };
  return {
    level: toLevelKey(levelLabel),
    subjectKey: mapped.subjectKey,
    subjectName: mapped.subjectName,
  };
}

export function buildSubjectAnalysisRoute(level, subjectKey) {
  return `/app/dashboard/subject/${level}/${subjectKey}`;
}

export function buildPracticeRoute(subjectKey, topicName) {
  const topicSlug = slugify(topicName);
  return `/app/practice?subject=${encodeURIComponent(subjectKey)}${
    topicSlug ? `&topic=${encodeURIComponent(topicSlug)}` : ""
  }`;
}

function getFallbackAnalysis(level, subjectKey, subjectName) {
  const fallbackKey = `${level}/${subjectKey}`;
  const fallbackMap = {
    "kssm-f4/kssm-am": normalizeAnalysis(
      {
        level: "kssm-f4",
        subjectKey: "kssm-am",
        subjectName: "Additional Mathematics",
        grade: "A+",
        scorePercent: 100,
        label: "CEMERLANG",
        questionsAnswered: 1,
        setsSubmitted: 1,
        difficulty: { easy: 0, medium: 100, hard: 0 },
        thinkingSkills: { lots: 0, mots: 100, hots: 0, mediumOrder: 100 },
        topics: [
          {
            chapter: 1,
            topicName: "Functions",
            topicUrl: "/learn/chapter/kssm-f4-am-01",
            scorePercent: 100,
            status: "Mastery",
          },
          {
            chapter: 2,
            topicName: "Quadratic Functions",
            topicUrl: "/learn/chapter/kssm-f4-am-02",
            scorePercent: null,
            status: "Not started",
          },
          {
            chapter: 3,
            topicName: "Equation Systems",
            topicUrl: "/learn/chapter/kssm-f4-am-03",
            scorePercent: null,
            status: "Not started",
          },
          {
            chapter: 4,
            topicName: "Inequalities",
            topicUrl: "/learn/chapter/kssm-f4-am-04",
            scorePercent: null,
            status: "Not started",
          },
        ],
      },
      { level: "kssm-f4", subjectKey: "kssm-am", subjectName: "Additional Mathematics" },
    ),
  };

  return (
    fallbackMap[fallbackKey] ||
    normalizeAnalysis(
      {
        level,
        subjectKey,
        subjectName,
        grade: null,
        scorePercent: null,
        label: null,
        questionsAnswered: null,
        setsSubmitted: null,
        difficulty: { easy: null, medium: null, hard: null },
        thinkingSkills: { lots: null, mots: null, hots: null, mediumOrder: null },
        topics: [],
      },
      { level, subjectKey, subjectName },
    )
  );
}

function sortByFocusPriority(topics) {
  const notStarted = [];
  const scored = [];

  topics.forEach((topic) => {
    const status = topic.status.toLowerCase();
    if (status.includes("not started")) {
      notStarted.push(topic);
      return;
    }
    scored.push(topic);
  });

  notStarted.sort((a, b) => a.chapter - b.chapter);
  scored.sort((a, b) => {
    const scoreA = a.scorePercent === null ? Number.POSITIVE_INFINITY : a.scorePercent;
    const scoreB = b.scorePercent === null ? Number.POSITIVE_INFINITY : b.scorePercent;
    if (scoreA === scoreB) {
      return a.chapter - b.chapter;
    }
    return scoreA - scoreB;
  });

  return [...notStarted, ...scored];
}

export function rankFocusTopics(analysis, limit = 3) {
  const topics = Array.isArray(analysis?.topics) ? analysis.topics : [];
  if (!topics.length) {
    return [];
  }

  const ranked = [];
  const seen = new Set();
  const ordered = sortByFocusPriority(topics);

  for (const topic of ordered) {
    if (seen.has(topic.topicName)) {
      continue;
    }
    seen.add(topic.topicName);
    ranked.push(topic);
    if (ranked.length >= limit) {
      break;
    }
  }

  if (ranked.length < limit) {
    const fallback = topics
      .filter((topic) => !seen.has(topic.topicName))
      .sort((a, b) => a.chapter - b.chapter);
    ranked.push(...fallback.slice(0, limit - ranked.length));
  }

  return ranked.slice(0, limit);
}

export async function fetchSubjectAnalysis(level, subjectKey, options = {}) {
  const { subjectName, fetchImpl } = options;
  const doFetch = fetchImpl || fetch;
  const fallback = {
    level,
    subjectKey,
    subjectName: subjectName || subjectKey,
  };

  const apiRoute = `/api/pbot/subject-analysis?level=${encodeURIComponent(
    level,
  )}&subjectKey=${encodeURIComponent(subjectKey)}`;

  try {
    const apiResponse = await doFetch(apiRoute, { credentials: "include" });
    if (apiResponse.ok) {
      const json = await apiResponse.json();
      return normalizeAnalysis(json, fallback);
    }
  } catch {
    // Ignore API failures and try HTML route.
  }

  const htmlRoute = buildSubjectAnalysisRoute(level, subjectKey);
  try {
    const htmlResponse = await doFetch(htmlRoute, { credentials: "include" });
    if (!htmlResponse.ok) {
      throw new Error(`HTML fetch failed with ${htmlResponse.status}`);
    }
    const html = await htmlResponse.text();
    const parsed = parseSubjectAnalysisHtml(
      html,
      level,
      subjectKey,
      fallback.subjectName,
    );

    if (parsed.topics.length === 0) {
      const fallbackData = getFallbackAnalysis(level, subjectKey, fallback.subjectName);
      return { ...parsed, topics: fallbackData.topics };
    }

    return parsed;
  } catch (error) {
    const fallbackData = getFallbackAnalysis(level, subjectKey, fallback.subjectName);
    if (fallbackData.topics.length > 0 || fallbackData.scorePercent !== null) {
      return fallbackData;
    }
    throw error;
  }
}

