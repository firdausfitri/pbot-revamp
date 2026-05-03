import {
  getStrongestSubject,
  getSubjectsBelowThreshold,
  getWeakestSubject,
  getWeakestTopic,
} from "./learnerSignals";

function getMasteryStatus(score) {
  if (score >= 70) {
    return "good";
  }
  if (score >= 50) {
    return "stable";
  }
  return "needs focus";
}

export function buildLearningInsights({ mastery, behaviour, contextStage }) {
  if (contextStage === "state_unsupported") {
    return [
      {
        id: "math-only-insight",
        tone: "warn",
        text: "This PBot prototype currently supports Mathematics only.",
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
      text: `Focus topic: ${weakestTopic.topic} (${weakestTopic.mastery}%)`,
    });
  }

  belowThreshold.forEach((subject) => {
    if (weakestSubject && subject.subject === weakestSubject.subject) {
      return;
    }
    insights.push({
      id: `below-threshold-${subject.subject}`,
      tone: "alert",
      text: `${subject.subject} is below 50% (${subject.mastery}%).`,
    });
  });

  if ((behaviour.typicalSessionMins ?? 0) < 7) {
    insights.push({
      id: "short-session",
      tone: "info",
      text: `You prefer short sessions (${behaviour.typicalSessionMins} minutes).`,
    });
  }

  if ((behaviour.quitAfterWrongRate ?? 0) > 25) {
    insights.push({
      id: "quit-after-wrong",
      tone: "warn",
      text: `After a wrong answer, you stop ${behaviour.quitAfterWrongRate}% of the time. Try an easier warm-up.`,
    });
  }

  if (behaviour.preferredTime) {
    insights.push({
      id: "preferred-time",
      tone: "info",
      text: `Best learning time: ${behaviour.preferredTime}.`,
    });
  }

  return insights.slice(0, 3);
}
