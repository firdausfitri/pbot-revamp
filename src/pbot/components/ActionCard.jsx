export default function ActionCard({ action, onPrimary, onSecondary }) {
  return (
    <div className="pbot-card pbot-card--action">
      <div className="pbot-row">
        <div>
          <div className="pbot-action-title">{action.title}</div>
          <div className="pbot-muted">{action.subtitle}</div>
        </div>
        <div className="pbot-pill">{action.duration}</div>
      </div>

      <div className="pbot-row" style={{ marginTop: 12 }}>
        <button
          className="pbot-btn"
          type="button"
          onClick={onPrimary}
          disabled={action.disabled}
        >
          {action.primaryLabel}
        </button>
        {action.secondaryLabel && action.secondaryLabel.length > 0 ? (
          <button
            className="pbot-btn pbot-btn--ghost"
            type="button"
            onClick={onSecondary}
            disabled={action.disabled}
          >
            {action.secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
