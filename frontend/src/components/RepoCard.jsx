import React, { useState } from "react";

export default function RepoCard({ name, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                textAlign: "left",
                background: hovered ? "var(--color-surface-3)" : "var(--color-surface-2)",
                border: `1px solid ${hovered ? "var(--color-surface-6)" : "var(--color-surface-4)"}`,
                borderRadius: "0.625rem",
                padding: "1rem",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                boxShadow: hovered
                    ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 15%, transparent)"
                    : "none",
                width: "100%",
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.75rem",
                    fontSize: "14px",
                }}
            >
                <span style={{ color: "var(--color-accent-bright)" }}>⌥</span>
            </div>

            {/* Name */}
            <p
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "var(--color-ink)",
                    wordBreak: "break-all",
                    lineHeight: 1.4,
                    marginBottom: "0.25rem",
                }}
            >
                {name}
            </p>
            <p
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: hovered ? "var(--color-accent-bright)" : "var(--color-ink-faint)",
                    transition: "color 0.15s",
                }}
            >
                open chat →
            </p>
        </button>
    );
}