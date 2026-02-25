import React, { useState, useEffect } from "react";
import IndexScreen from "./components/IndexScreen.jsx";
import ChatScreen from "./components/ChatScreen.jsx";
import { fetchRepos } from "./api/client.js";

export default function App() {
    const [activeRepo, setActiveRepo] = useState(null);
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        fetchRepos().then(setRepos).catch(() => {});
    }, []);

    const handleIndexed = (repoName) => {
        setRepos((prev) =>
            prev.includes(repoName) ? prev : [...prev, repoName]
        );
        setActiveRepo(repoName);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
                background: "var(--color-surface-0)",
            }}
        >
            {/* ── Header ─────────────────────────────────── */}
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0 1.5rem",
                    height: "52px",
                    borderBottom: "1px solid var(--color-surface-3)",
                    background: "var(--color-surface-1)",
                    flexShrink: 0,
                }}
            >
                {/* Wordmark */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                        style={{
                            width: "22px",
                            height: "22px",
                            border: "1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)",
                            background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "var(--color-accent-bright)",
                        }}
                    >
                        R
                    </div>
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: "600",
                            fontSize: "14px",
                            letterSpacing: "-0.02em",
                            color: "var(--color-ink)",
                        }}
                    >
            repo<span style={{ color: "var(--color-accent-bright)" }}>rag</span>
          </span>
                </div>

                {/* Badge */}
                <span
                    className="tag"
                    style={{
                        color: "var(--color-accent-bright)",
                        borderColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)",
                        background: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
                    }}
                >
          DeepSeek-Coder-V2
        </span>

                {/* Active repo breadcrumb */}
                {activeRepo && (
                    <>
                        <div
                            style={{
                                width: "1px",
                                height: "16px",
                                background: "var(--color-surface-5)",
                                margin: "0 0.25rem",
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--color-ink-muted)",
                                maxWidth: "280px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
              {activeRepo}
            </span>

                        <button
                            onClick={() => setActiveRepo(null)}
                            style={{
                                marginLeft: "auto",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--color-ink-muted)",
                                background: "transparent",
                                border: "1px solid var(--color-surface-5)",
                                borderRadius: "6px",
                                padding: "0.3rem 0.75rem",
                                cursor: "pointer",
                                transition: "color 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--color-ink)";
                                e.currentTarget.style.borderColor = "var(--color-surface-6)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--color-ink-muted)";
                                e.currentTarget.style.borderColor = "var(--color-surface-5)";
                            }}
                        >
                            ← back
                        </button>
                    </>
                )}
            </header>

            {/* ── Body ───────────────────────────────────── */}
            <main style={{ flex: 1, overflow: "hidden" }}>
                {activeRepo ? (
                    <ChatScreen repoName={activeRepo} />
                ) : (
                    <IndexScreen
                        repos={repos}
                        onIndexed={handleIndexed}
                        onSelectRepo={setActiveRepo}
                    />
                )}
            </main>
        </div>
    );
}