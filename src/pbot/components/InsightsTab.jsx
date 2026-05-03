import { useMemo, useState } from "react";
import MasteryBar from "./MasteryBar";
import SubjectDeepDive from "./SubjectDeepDive";
import { resolveSubjectMeta } from "../utils/subjectAnalysis";

function SubjectRow({ profile, subject, onViewMore }) {
  const meta = resolveSubjectMeta({
    subjectName: subject.subject,
    levelLabel: profile.level,
  });

  return (
    <div style={{ marginBottom: 12 }}>
      <div className="pbot-row">
        <span>
          <b>{subject.subject}</b>
        </span>
        <span>{subject.mastery}/100</span>
      </div>
      <MasteryBar value={subject.mastery} />
      <div className="pbot-row" style={{ marginTop: 8 }}>
        <span className="pbot-footnote">Subject analysis</span>
        <button
          type="button"
          className="pbot-view-more"
          onClick={() => onViewMore(meta)}
        >
          View more
        </button>
      </div>
    </div>
  );
}

export default function InsightsTab({
  profile,
  mastery,
  behaviour,
  segment,
  insights,
  deepDiveState,
  focusTopics,
  onViewMore,
  onDeepDiveBack,
  onDeepDiveRetry,
  onOpenLink,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const keyInsights = useMemo(() => insights.slice(0, 3), [insights]);

  if (deepDiveState.view === "subjectDeepDive") {
    return (
      <SubjectDeepDive
        deepDiveState={deepDiveState}
        focusTopics={focusTopics}
        onBack={onDeepDiveBack}
        onRetry={onDeepDiveRetry}
        onOpenLink={onOpenLink}
      />
    );
  }

  return (
    <div className="pbot-section">
      <div className="pbot-row">
        <h3 className="pbot-h3">Learning Insights</h3>
        <button
          type="button"
          className="pbot-view-more"
          onClick={() => setShowDetails((prev) => !prev)}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>
      <div className="pbot-card">
        <div className="pbot-insights-list">
          {keyInsights.map((insight) => (
            <div key={insight.id} className={`pbot-insight-item tone-${insight.tone}`}>
              {insight.text}
            </div>
          ))}
        </div>
      </div>

      {showDetails ? (
        <>
          <h3 className="pbot-h3">Learner Profile</h3>
          <div className="pbot-card">
            <div>
              <b>Name:</b> {profile.name}
            </div>
            <div>
              <b>Level:</b> {profile.level}
            </div>
            <div>
              <b>Language:</b> {profile.language}
            </div>
            <div>
              <b>Daily goal:</b> {profile.goal}
            </div>
            <div>
              <b>Segment:</b> {segment.label}
            </div>
          </div>

          <h3 className="pbot-h3">Subject Mastery</h3>
          <div className="pbot-card">
            {mastery.subjects.map((subject) => (
              <SubjectRow
                key={subject.subject}
                profile={profile}
                subject={subject}
                onViewMore={onViewMore}
              />
            ))}
          </div>

          <h3 className="pbot-h3">Weak Topics (Top)</h3>
          <div className="pbot-card pbot-chips">
            {mastery.weakTopics.slice(0, 5).map((topic) => (
              <span key={topic.topic} className="pbot-chip">
                {topic.topic} - {topic.mastery}/100
              </span>
            ))}
          </div>

          <h3 className="pbot-h3">Behaviour Signals</h3>
          <div className="pbot-card">
            <div>
              <b>Typical session:</b> {behaviour.typicalSessionMins} mins
            </div>
            <div>
              <b>Quit after wrong:</b> {behaviour.quitAfterWrongRate}%
            </div>
            <div>
              <b>Preferred time:</b> {behaviour.preferredTime}
            </div>
          </div>
        </>
      ) : (
        <div className="pbot-footnote">
          Tap "Show details" to view the full breakdown.
        </div>
      )}
    </div>
  );
}
