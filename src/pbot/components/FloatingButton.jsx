import mascot from "../assets/pbot-mascot.svg";

export default function FloatingButton({
  open,
  onClick,
  attentionPulse,
  nudge,
  onNudgeOpenCoach,
  onNudgeDismiss,
}) {
  return (
    <>
      {nudge ? (
        <div className="pbot-nudge" role="status" aria-live="polite">
          <div className="pbot-nudge__text">{nudge.message}</div>
          <div className="pbot-nudge__actions">
            <button type="button" className="pbot-nudge__btn" onClick={onNudgeOpenCoach}>
              Buka Coach
            </button>
            <button
              type="button"
              className="pbot-nudge__btn pbot-nudge__btn--ghost"
              onClick={onNudgeDismiss}
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}

      <button
        className={`pbot-fab ${open ? "is-open" : ""} ${
          attentionPulse ? "is-attention" : ""
        }`}
        type="button"
        onClick={onClick}
        aria-label={open ? "Close PBot" : "Open PBot"}
        title={open ? "Close" : "Ask PBot"}
      >
        <span className="pbot-fab__pulse" aria-hidden="true" />
        <span className="pbot-fab__spark pbot-fab__spark--left" aria-hidden="true" />
        <span className="pbot-fab__spark pbot-fab__spark--right" aria-hidden="true" />
        <img src={mascot} alt="" className="pbot-fab__mascot" />
        <span className="pbot-fab__eyes" aria-hidden="true">
          <span className="pbot-fab__eye pbot-fab__eye--left" />
          <span className="pbot-fab__eye pbot-fab__eye--right" />
        </span>
      </button>
    </>
  );
}

