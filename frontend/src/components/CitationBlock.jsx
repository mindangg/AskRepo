import React, { useState } from "react";

export default function CitationBlock({ citation }) {
    const [expanded, setExpanded] = useState(false);
    const lineCount = citation.end_line - citation.start_line + 1;

    return (
        <div
            style={{
                border: "1px solid var(--color-surface-4)",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.875rem",
                    background: expanded ? "var(--color-surface-3)" : "var(--color-surface-2)",
                    cursor: "pointer",
                    border: "none",
                    transition: "background 0.15s",
                    textAlign: "left",
                    gap: "0.75rem",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-surface-3)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = expanded
                        ? "var(--color-surface-3)"
                        : "var(--color-surface-2)")
                }
            >
                {/* Left: file path */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        minWidth: 0,
                        flex: 1,
                    }}
                >
          <span style={{ color: "var(--color-accent)", fontSize: "11px", flexShrink: 0 }}>
            ⎇
          </span>
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--color-accent-bright)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
            {citation.file_path}
          </span>
                </div>

                {/* Right: meta + toggle */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexShrink: 0,
                    }}
                >
          <span
              style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--color-ink-faint)",
                  whiteSpace: "nowrap",
              }}
          >
            L{citation.start_line}–{citation.end_line}
          </span>
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            color: "var(--color-ink-faint)",
                            whiteSpace: "nowrap",
                        }}
                    >
            {lineCount} line{lineCount !== 1 ? "s" : ""}
          </span>
                    <span
                        style={{
                            fontSize: "10px",
                            color: "var(--color-ink-faint)",
                            display: "inline-block",
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s",
                        }}
                    >
            ▾
          </span>
                </div>
            </button>

            {/* Code snippet */}
            {expanded && (
                <div
                    style={{
                        borderTop: "1px solid var(--color-surface-4)",
                        background: "var(--color-surface-0)",
                    }}
                >
                    {/* Snippet toolbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.3rem 0.875rem",
                            borderBottom: "1px solid var(--color-surface-3)",
                            background: "var(--color-surface-1)",
                        }}
                    >
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-faint)",
                }}
            >
              snippet
            </span>
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                color: "var(--color-ink-faint)",
                            }}
                        >
              {citation.file_path.split(".").pop()?.toUpperCase()}
            </span>
                    </div>

                    {/* Code */}
                    <pre
                        style={{
                            margin: 0,
                            padding: "1rem",
                            fontFamily: "var(--font-mono)",
                            fontSize: "11.5px",
                            color: "var(--color-ink-muted)",
                            lineHeight: 1.7,
                            overflowX: "auto",
                            overflowY: "auto",
                            maxHeight: "280px",
                            whiteSpace: "pre",
                            background: "transparent",
                        }}
                    >
            <code>{citation.snippet}</code>
          </pre>
                </div>
            )}
        </div>
    );
}