export function segmentUser({ mastery, behaviour }) {
  const mathMastery =
    mastery.subjects.find((subject) => subject.subject === "Mathematics")
      ?.mastery ?? 50;
  const quitAfterWrong = behaviour.quitAfterWrongRate ?? 0;

  if (mathMastery < 50 && quitAfterWrong > 25) {
    return { label: "Struggler", reason: "Low mastery + high quit after wrong" };
  }
  if (mathMastery >= 75) {
    return { label: "High Performer", reason: "High mastery" };
  }
  if ((behaviour.typicalSessionMins ?? 0) <= 5) {
    return { label: "Sprinter", reason: "Short sessions" };
  }
  return { label: "Regular Learner", reason: "Balanced pattern" };
}
