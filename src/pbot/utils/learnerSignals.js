function parseGoalTarget(goalText) {
  if (typeof goalText !== "string") {
    return 0;
  }
  const match = goalText.match(/(\d+)\s*quizzes?\s*\/\s*day/i);
  return match ? Number(match[1]) : 0;
}

export function getGoalProgress(profile) {
  const target = Number(profile.dailyGoalTarget) || parseGoalTarget(profile.goal) || 0;
  const completed = Math.max(0, Number(profile.dailyGoalCompleted) || 0);
  const remaining = Math.max(0, target - completed);

  return {
    target,
    completed,
    remaining,
    isComplete: target > 0 ? remaining === 0 : false,
  };
}

export function getStrongestSubject(mastery) {
  if (!mastery?.subjects?.length) {
    return null;
  }
  return mastery.subjects.reduce((best, subject) => {
    return subject.mastery > best.mastery ? subject : best;
  });
}

export function getWeakestSubject(mastery) {
  if (!mastery?.subjects?.length) {
    return null;
  }
  return mastery.subjects.reduce((worst, subject) => {
    return subject.mastery < worst.mastery ? subject : worst;
  });
}

export function getWeakestTopic(mastery) {
  if (!mastery?.weakTopics?.length) {
    return null;
  }
  return mastery.weakTopics.reduce((worst, topic) => {
    return topic.mastery < worst.mastery ? topic : worst;
  });
}

export function getSubjectsBelowThreshold(mastery, threshold = 50) {
  if (!mastery?.subjects?.length) {
    return [];
  }
  return mastery.subjects.filter((subject) => subject.mastery < threshold);
}

export function formatQuizCount(count) {
  return `${count} ${count === 1 ? "quiz" : "quizzes"}`;
}
