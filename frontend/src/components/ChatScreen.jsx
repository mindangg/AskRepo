import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage.jsx";
import { chat } from "../api/client.js";

const SUGGESTIONS = [
  "How does routing work?",
  "Where is authentication handled?",
  "How is the database connected?",
  "What does the main entry point do?",
];

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="var(--ink-4)" strokeWidth="1.25" />
      <path d="M7.5 7.5C7.5 6.12 8.62 5 10 5s2.5 1.12 2.5 2.5c0 1.5-1.5 2.5-2.5 3" stroke="var(--ink-4)" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="10" cy="14.25" r="0.75" fill="var(--ink-4)" />
    </svg>
  );
}

export default function ChatScreen({ repoName }) {
  const [messages, setMessages]   = useState([]);
  const [question, setQuestion]   = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setMessages((prev) => [...prev, { type: "user", text: q }]);
    setLoading(true);
    try {
      const data = await chat(q, repoName);
      setMessages((prev) => [
        ...prev,
        { type: "assistant", answer: data.answer, citations: data.citations },
      ]);
    } catch (e) {
      setMessages((prev) => [...prev, { type: "error", text: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">

      {/* Messages */}
      <div className="chat-page__body">
        <div className="chat-page__inner">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="chat-empty">
              <div className="chat-empty__icon">
                <QuestionIcon />
              </div>
              <h2 className="chat-empty__title">
                Ask anything about <code>{repoName}</code>
              </h2>
              <p className="chat-empty__hint">Enter to send · Shift+Enter for newline</p>
              <div className="chat-empty__pills">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-pill"
                    onClick={() => {
                      setQuestion(s);
                      inputRef.current?.focus();
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="msg-typing">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <div className="chat-input-bar__inner">
          <div className="chat-input-box">
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="Ask a question about the codebase…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              className="chat-input-box__textarea"
              spellCheck={false}
            />
            <button
              className="btn btn--primary"
              style={{ borderRadius: 10, height: 38, padding: "0 16px" }}
              onClick={handleSend}
              disabled={loading || !question.trim()}
            >
              Send <SendIcon />
            </button>
          </div>
          <p className="chat-input-bar__footer">
            Answers include exact file paths and line numbers from{" "}
            <code>{repoName}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
