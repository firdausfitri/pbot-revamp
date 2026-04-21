export default function MasteryBar({ value }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="pbot-bar">
      <div className="pbot-bar__fill" style={{ width: `${width}%` }} />
    </div>
  );
}
