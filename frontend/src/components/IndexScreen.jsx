import React, { useState } from "react";
import RepoCard from "./RepoCard.jsx";
import { indexRepo } from "../api/client.js";

export default function IndexScreen({ repos, onIndexed, onSelectRepo }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleIndex = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const data = await indexRepo(url.trim());
            const msg =
                data.status === "already_indexed"
                    ? `"${data.repo_name}" already indexed — opening chat.`
                    : `"${data.repo_name}" indexed: ${data.files_indexed} files · ${data.chunks_created} chunks.`;
            setSuccess(msg);
            onIndexed(data.repo_name);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter") handleIndex();
    };

    return (
        <div
            className="grid-bg"
            style={{
                height: "100%",
                overflowY: "auto",
            }}
        >
            <div
                style={{
                    maxWidth: "680px",
                    margin: "0 auto",
                    padding: "4rem 1.5rem 3rem",
                }}
            >
                {/* ── Hero ─────────────────────────────────── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <p
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--color-accent)",
                            marginBottom: "0.75rem",
                            opacity: 0.8,
                        }}
                    >
                        // local · no api keys · fully private
                    </p>
                    <h1
                        style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "clamp(1.5rem, 4vw, 2rem)",
                            fontWeight: "600",
                            color: "var(--color-ink)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.2,
                            marginBottom: "0.625rem",
                        }}
                    >
                        Index a Repository
                    </h1>
                    <p
                        style={{
                            fontSize: "0.875rem",
                            color: "var(--color-ink-muted)",
                            lineHeight: 1.6,
                            maxWidth: "480px",
                        }}
                    >
                        Paste a public GitHub URL. Code is chunked, embedded, and stored
                        locally. Ask questions and get answers with exact file &amp; line citations.
                    </p>
                </div>

                {/* ── URL Input Row ─────────────────────────── */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
            <span
                style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-accent-muted)",
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
              $
            </span>
                        <input
                            className="input-base"
                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 1.875rem" }}
                            placeholder="https://github.com/owner/repo"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKey}
                            disabled={loading}
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </div>
                    <button
                        className="btn-primary"
                        style={{ padding: "0.75rem 1.25rem", whiteSpace: "nowrap" }}
                        onClick={handleIndex}
                        disabled={loading || !url.trim()}
                    >
                        {loading ? "Indexing…" : "Index →"}
                    </button>
                </div>

                {/* ── Progress ─────────────────────────────── */}
                {loading && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            background: "var(--color-surface-2)",
                            border: "1px solid var(--color-surface-4)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            marginBottom: "1rem",
                            animation: "fadeUp 0.2s ease forwards",
                        }}
                    >
                        <div
                            style={{
                                width: "14px",
                                height: "14px",
                                border: "2px solid var(--color-surface-5)",
                                borderTopColor: "var(--color-accent)",
                                borderRadius: "50%",
                                animation: "spin 0.65s linear infinite",
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--color-ink-muted)",
                            }}
                        >
              cloning · chunking · embedding — this may take a minute…
            </span>
                    </div>
                )}

                {/* ── Error ────────────────────────────────── */}
                {error && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.625rem",
                            background: "var(--color-danger-bg)",
                            border: "1px solid var(--color-danger-border)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            marginBottom: "1rem",
                            animation: "fadeUp 0.2s ease forwards",
                        }}
                    >
                        <span style={{ color: "var(--color-danger-text)", marginTop: "1px", flexShrink: 0 }}>✕</span>
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--color-danger-text)",
                            }}
                        >
              {error}
            </span>
                    </div>
                )}

                {/* ── Success ──────────────────────────────── */}
                {success && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.625rem",
                            background: "var(--color-success-bg)",
                            border: "1px solid var(--color-success-border)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            marginBottom: "1rem",
                            animation: "fadeUp 0.2s ease forwards",
                        }}
                    >
                        <span style={{ color: "var(--color-success-text)", marginTop: "1px", flexShrink: 0 }}>✓</span>
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--color-success-text)",
                            }}
                        >
              {success}
            </span>
                    </div>
                )}

                {/* ── Previously indexed ───────────────────── */}
                {repos.length > 0 && (
                    <div style={{ marginTop: "3rem" }}>
                        <div className="divider-label" style={{ marginBottom: "1rem" }}>
                            Previously Indexed
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(188px, 1fr))",
                                gap: "0.75rem",
                            }}
                        >
                            {repos.map((r) => (
                                <RepoCard key={r} name={r} onClick={() => onSelectRepo(r)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}