import { buildPracticeRoute, buildSubjectAnalysisRoute } from "../utils/subjectAnalysis";

function SummaryLine({ analysis }) {
  const grade = analysis.grade || "-";
  const score = analysis.scorePercent === null ? "-" : `${analysis.scorePercent}%`;
  const answered = analysis.questionsAnswered === null ? "-" : analysis.questionsAnswered;
  return (
    <div className="pbot-deepdive-summary">
      {grade} ({score}) • {answered} Q answered
    </div>
  );
}

function MetricGroup({ title, items }) {
  const visibleItems = items.filter((item) => item.value !== null);
  if (!visibleItems.length) {
    return null;
  }

  return (
    <div>
      <h3 className="pbot-h3">{title}</h3>
      <div className="pbot-card pbot-chips">
        {visibleItems.map((item) => (
          <span key={item.id} className="pbot-chip pbot-chip--static">
            {item.label}: {item.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

function FocusTopicItem({ analysis, topic, onOpenLink }) {
  const score =
    topic.scorePercent === null || topic.scorePercent === undefined
      ? "—"
      : `${topic.scorePercent}%`;

  const practiceUrl = buildPracticeRoute(analysis.subjectKey, topic.topicName);

  return (
    <div className="pbot-card">
      <div className="pbot-row">
        <div>
          <div style={{ fontWeight: 700 }}>{topic.topicName}</div>
          <div className="pbot-muted">
            {topic.status} • {score}
          </div>
        </div>
        <span className="pbot-pill">Ch {topic.chapter}</span>
      </div>

      <div className="pbot-row" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="pbot-btn pbot-btn--small"
          onClick={() => onOpenLink(topic.topicUrl)}
        >
          Learn
        </button>
        <button
          type="button"
          className="pbot-btn pbot-btn--ghost pbot-btn--small"
          onClick={() => onOpenLink(practiceUrl)}
        >
          Practice
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="pbot-card">
      <div className="pbot-skeleton pbot-skeleton--w60" />
      <div className="pbot-skeleton pbot-skeleton--w45" />
      <div className="pbot-skeleton pbot-skeleton--w90" />
      <div className="pbot-footnote">Loading subject analysis...</div>
    </div>
  );
}

export default function SubjectDeepDive({
  deepDiveState,
  focusTopics,
  onBack,
  onRetry,
  onOpenLink,
}) {
  const { status, analysis, request } = deepDiveState;
  const route = request
    ? buildSubjectAnalysisRoute(request.level, request.subjectKey)
    : "#";

  return (
    <div className="pbot-section">
      <div className="pbot-row">
        <h3 className="pbot-h3">Subject deep dive</h3>
        <button type="button" className="pbot-view-more" onClick={onBack}>
          Back
        </button>
      </div>

      {status === "loading" ? <LoadingState /> : null}

      {status === "error" ? (
        <div className="pbot-card">
          <div style={{ fontWeight: 700 }}>Tak dapat load analysis sekarang.</div>
          <div className="pbot-footnote">
            Cuba lagi atau buka halaman analysis penuh.
          </div>
          <div className="pbot-row" style={{ marginTop: 10 }}>
            <button type="button" className="pbot-btn pbot-btn--small" onClick={onRetry}>
              Retry
            </button>
            <button
              type="button"
              className="pbot-btn pbot-btn--ghost pbot-btn--small"
              onClick={() => onOpenLink(route)}
            >
              Open full analysis
            </button>
          </div>
        </div>
      ) : null}

      {status === "success" && analysis ? (
        <>
          <div className="pbot-card">
            <div className="pbot-row">
              <div style={{ fontWeight: 700 }}>{analysis.subjectName}</div>
              {analysis.label ? <span className="pbot-pill">{analysis.label}</span> : null}
            </div>
            <SummaryLine analysis={analysis} />
            <div className="pbot-footnote">
              {analysis.setsSubmitted ?? "-"} set submitted
            </div>
          </div>

          <MetricGroup
            title="Result by difficulty"
            items={[
              { id: "easy", label: "Easy", value: analysis.difficulty.easy },
              { id: "medium", label: "Med", value: analysis.difficulty.medium },
              { id: "hard", label: "Hard", value: analysis.difficulty.hard },
            ]}
          />

          <MetricGroup
            title="Thinking skills"
            items={[
              { id: "lots", label: "LOTS", value: analysis.thinkingSkills.lots },
              { id: "mots", label: "MOTS", value: analysis.thinkingSkills.mots },
              { id: "hots", label: "HOTS", value: analysis.thinkingSkills.hots },
              {
                id: "mo",
                label: "Medium Order",
                value: analysis.thinkingSkills.mediumOrder ?? null,
              },
            ]}
          />

          <h3 className="pbot-h3">Focus topics</h3>
          {focusTopics.length === 0 ? (
            <div className="pbot-card">
              <div style={{ fontWeight: 700 }}>Tiada topik untuk difokuskan.</div>
              <div className="pbot-footnote">
                Hebat, teruskan dengan latihan lebih mencabar.
              </div>
              <button
                type="button"
                className="pbot-btn pbot-btn--small"
                style={{ marginTop: 10 }}
                onClick={() => onOpenLink(buildPracticeRoute(analysis.subjectKey, ""))}
              >
                Practice
              </button>
            </div>
          ) : (
            focusTopics.map((topic) => (
              <FocusTopicItem
                key={`${analysis.subjectKey}-${topic.chapter}`}
                analysis={analysis}
                topic={topic}
                onOpenLink={onOpenLink}
              />
            ))
          )}
        </>
      ) : null}
    </div>
  );
}

