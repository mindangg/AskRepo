import React from "react";
import CitationBlock from "./CitationBlock.jsx";

export default function ChatMessage({ msg }) {
    if (msg.type === "user") {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    animation: "fadeUp 0.2s ease forwards",
                }}
            >
                <div
                    style={{
                        maxWidth: "70%",
                        background: "var(--color-accent-dim)",
                        border: "1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)",
                        borderRadius: "12px 12px 3px 12px",
                        padding: "0.75rem 1rem",
                        fontSize: "13px",
                        lineHeight: 1.65,
                        color: "var(--color-ink)",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    {msg.text}
                </div>
            </div>
        );
    }

    if (msg.type === "error") {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    background: "var(--color-danger-bg)",
                    border: "1px solid var(--color-danger-border)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    animation: "fadeUp 0.2s ease forwards",
                }}
            >
                <span style={{ color: "var(--color-danger-text)", flexShrink: 0 }}>✕</span>
                <span
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--color-danger-text)",
                    }}
                >
          {msg.text}
        </span>
            </div>
        );
    }

    // Assistant
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxWidth: "88%",
                animation: "fadeUp 0.2s ease forwards",
            }}
        >
            {/* Answer */}
            <div
                style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-surface-4)",
                    borderRadius: "3px 12px 12px 12px",
                    padding: "1rem 1.25rem",
                }}
            >
        <pre
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12.5px",
                color: "var(--color-ink)",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
            }}
        >
          {msg.answer}
        </pre>
            </div>

            {/* Citations */}
            {msg.citations?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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