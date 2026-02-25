import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage.jsx";
import { chat } from "../api/client.js";

export default function ChatScreen({ repoName }) {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

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
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* ── Messages ───────────────────────────────── */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.5rem 1.5rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                }}
            >
                {messages.length === 0 && !loading && (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            padding: "5rem 0",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "10px",
                                background: "var(--color-surface-3)",
                                border: "1px solid var(--color-surface-5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                            }}
                        >
                            ⟩_
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--color-ink-muted)" }}>
                            Ask anything about{" "}
                            <span
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-ink)",
                                    fontWeight: "500",
                                }}
                            >
                {repoName}
              </span>
                        </p>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "10px",
                                color: "var(--color-ink-faint)",
                            }}
                        >
                            Enter to send · Shift+Enter for newline
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <ChatMessage key={i} msg={msg} />
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "0.25rem" }}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--color-accent)",
                                    animation: "pulseDot 1.4s ease-in-out infinite",
                                    animationDelay: `${i * 0.16}s`,
                                }}
                            />
                        ))}
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--color-ink-faint)",
                                marginLeft: "0.25rem",
                            }}
                        >
              generating…
            </span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Input bar ──────────────────────────────── */}
            <div
                style={{
                    flexShrink: 0,
                    borderTop: "1px solid var(--color-surface-3)",
                    background: "var(--color-surface-1)",
                    padding: "1rem 1.5rem",
                }}
            >
                <div
                    style={{
                        maxWidth: "860px",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "0.625rem",
                    }}
                >
          <textarea
              ref={inputRef}
              rows={2}
              placeholder="Ask a question about the codebase…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              className="input-base"
              style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  resize: "none",
                  lineHeight: 1.6,
              }}
              spellCheck={false}
          />
                    <button
                        className="btn-primary"
                        style={{
                            padding: "0.75rem 1rem",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                        }}
                        onClick={handleSend}
                        disabled={loading || !question.trim()}
                        title="Send (Enter)"
                    >
                        Send
                        <span style={{ fontSize: "12px", opacity: 0.7 }}>↵</span>
                    </button>
                </div>
            </div>
        </div>
    );
}