export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="pbot-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`pbot-tab ${active === tab.id ? "is-active" : ""}`}
          type="button"
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={active === tab.id}
        >
          {tab.icon ? <span className="pbot-tab__icon">{tab.icon}</span> : null}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
