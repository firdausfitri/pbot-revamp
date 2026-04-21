export default function Drawer({ open, onClose, title, children }) {
  return (
    <>
      <div
        className={`pbot-overlay ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`pbot-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pbot-drawer__header">
          <div className="pbot-title-wrap">
            <div className="pbot-title">{title}</div>
            <span className="pbot-title-badge">Study buddy</span>
          </div>
          <button className="pbot-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pbot-drawer__body">{children}</div>
      </aside>
    </>
  );
}
