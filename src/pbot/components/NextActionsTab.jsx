import ActionCard from "./ActionCard";

export default function NextActionsTab({
  recommendations,
  context,
  segment,
  onAction,
}) {
  const topActions = recommendations.slice(0, 3);

  return (
    <div className="pbot-section">
      <div className="pbot-card pbot-card--soft">
        <div className="pbot-row pbot-row--inline">
          <span className="pbot-pill">{segment.label}</span>
          <span className="pbot-pill">{context.subject}</span>
          <span className="pbot-pill">{context.mode}</span>
        </div>
      </div>

      <h3 className="pbot-h3">Recommended Next Actions</h3>

      {topActions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onPrimary={() => onAction(action, false)}
          onSecondary={() => onAction(action, true)}
        />
      ))}
    </div>
  );
}
