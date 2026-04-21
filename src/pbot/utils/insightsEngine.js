import {
  getStrongestSubject,
  getSubjectsBelowThreshold,
  getWeakestSubject,
  getWeakestTopic,
} from "./learnerSignals";

function getMasteryStatus(score) {
  if (score >= 70) {
    return "bagus";
  }
  if (score >= 50) {
    return "stabil";
  }
  return "perlu fokus";
}

export function buildLearningInsights({ mastery, behaviour, contextStage }) {
  if (contextStage === "state_unsupported") {
    return [
      {
        id: "math-only-insight",
        tone: "warn",
        text: "PBot prototype sekarang support Mathematics sahaja.",
      },
    ];
  }

  const insights = [];

  const strongest = getStrongestSubject(mastery);
  const weakestSubject = getWeakestSubject(mastery);
  const weakestTopic = getWeakestTopic(mastery);
  const belowThreshold = getSubjectsBelowThreshold(mastery, 50);

  if (strongest) {
    insights.push({
      id: "strongest-subject",
      tone: "good",
      text: `${strongest.subject}: ${strongest.mastery}% (${getMasteryStatus(
        strongest.mastery,
      )})`,
    });
  }

  if (weakestSubject && (!strongest || weakestSubject.subject !== strongest.subject)) {
    insights.push({
      id: "weakest-subject",
      tone: "warn",
      text: `${weakestSubject.subject}: ${weakestSubject.mastery}% (${getMasteryStatus(
        weakestSubject.mastery,
      )})`,
    });
  }

  if (weakestTopic) {
    insights.push({
      id: "weakest-topic",
      tone: "warn",
      text: `Topik fokus: ${weakestTopic.topic} (${weakestTopic.mastery}%)`,
    });
  }

  belowThreshold.forEach((subject) => {
    if (weakestSubject && subject.subject === weakestSubject.subject) {
      return;
    }
    insights.push({
      id: `below-threshold-${subject.subject}`,
      tone: "alert",
      text: `${subject.subject} bawah 50% (${subject.mastery}%).`,
    });
  });

  if ((behaviour.typicalSessionMins ?? 0) < 7) {
    insights.push({
      id: "short-session",
      tone: "info",
      text: `Anda suka sesi ringkas (${behaviour.typicalSessionMins} minit).`,
    });
  }

  if ((behaviour.quitAfterWrongRate ?? 0) > 25) {
    insights.push({
      id: "quit-after-wrong",
      tone: "warn",
      text: `Bila salah, berhenti ${behaviour.quitAfterWrongRate}%. Cuba warm-up mudah.`,
    });
  }

  if (behaviour.preferredTime) {
    insights.push({
      id: "preferred-time",
      tone: "info",
      text: `Masa terbaik belajar: ${behaviour.preferredTime}.`,
    });
  }

  return insights.slice(0, 3);
}
