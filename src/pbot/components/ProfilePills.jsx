export default function ProfilePills({ userContext, pageContext, pbotState }) {
  const pills = [userContext.segment, userContext.level];
  const showSubjectPill = Boolean(pageContext.selectedSubject) && (
    pbotState === "quiz" ||
    pbotState === "subject_selected" ||
    pbotState === "learn"
  );

  if (showSubjectPill) {
    pills.push(pageContext.selectedSubject);
  }

  if (
    pageContext.selectedTopic &&
    (pbotState === "quiz" || pbotState === "subject_selected" || pbotState === "learn")
  ) {
    pills.push(pageContext.selectedTopic);
  }

  if (pbotState === "quiz") {
    pills.push(`Mode: ${pageContext.mode}`);
  }

  return (
    <div className="pbot-card pbot-card--soft">
      <div className="pbot-chips">
        {pills.map((pill) => (
          <span key={pill} className="pbot-chip pbot-chip--static">
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
