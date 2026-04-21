import { useState } from "react";
import ProfilePills from "./ProfilePills";

export default function CoachTab({
  userContext,
  pageContext,
  pbotState,
  coachSnapshot,
  messages,
  isThinking,
  onSendMessage,
  onQuickAction,
}) {
  const [input, setInput] = useState("");
  const visibleActions = coachSnapshot.quickActions.slice(0, 3);

  function submit(event) {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    onSendMessage(input);
    setInput("");
  }

  return (
    <div className="pbot-section">
      <ProfilePills
        userContext={userContext}
        pageContext={pageContext}
        pbotState={pbotState}
      />

      <div className="pbot-card pbot-card--coach">
        <div className="pbot-row">
          <b>Coach Chat</b>
        </div>

        <div className="pbot-status-line">{coachSnapshot.statusLine}</div>
        <div className="pbot-chat pbot-chat--coach">
          <div className="pbot-bubble is-bot">{coachSnapshot.message}</div>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`pbot-bubble ${message.role === "user" ? "is-user" : "is-bot"}`}
            >
              {message.text}
            </div>
          ))}
          {isThinking ? <div className="pbot-bubble is-bot">Sedang fikir...</div> : null}
        </div>

        <form className="pbot-input" onSubmit={submit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tanya coach... contoh: hint / nota / video"
          />
          <button type="submit" disabled={!input.trim() || isThinking}>
            Send
          </button>
        </form>

        {visibleActions.length > 0 ? (
          <div className="pbot-quick-actions pbot-quick-actions--chips">
            {visibleActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="pbot-chip pbot-chip--button"
                onClick={() => onQuickAction(action)}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
