import React from "react";
import CitationBlock from "./CitationBlock.jsx";

function SenderIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="1" y="1" width="3" height="3" rx="0.75" fill="white" />
      <rect x="6" y="1" width="3" height="3" rx="0.75" fill="white" opacity="0.6" />
      <rect x="1" y="6" width="3" height="3" rx="0.75" fill="white" opacity="0.5" />
      <rect x="6" y="6" width="3" height="3" rx="0.75" fill="white" opacity="0.25" />
    </svg>
  );
}

export default function ChatMessage({ msg }) {

  if (msg.type === "user") {
    return (
      <div className="msg-user">
        <div className="msg-user__bubble">{msg.text}</div>
      </div>
    );
  }

  if (msg.type === "error") {
    return (
      <div className="msg-error">
        <span style={{ flexShrink: 0 }}>✕</span>
        <span>{msg.text}</span>
      </div>
    );
  }

  // Assistant
  return (
    <div className="msg-assistant">
      <div className="msg-sender">
        <div className="msg-sender__icon">
          <SenderIcon />
        </div>
        <span className="msg-sender__name">RepoRAG</span>
      </div>

      <pre className="msg-text">{msg.answer}</pre>

      {msg.citations?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div className="divider-label">
            {msg.citations.length} source{msg.citations.length !== 1 ? "s" : ""}
          </div>
          {msg.citations.map((c, i) => (
            <CitationBlock key={i} citation={c} />
          ))}
        </div>
      )}
    </div>
  );
}
