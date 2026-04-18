import React, { useState } from "react";
import RepoCard from "./RepoCard.jsx";
import { indexRepo } from "../api/client.js";

export default function IndexScreen({ repos, onIndexed, onSelectRepo }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleIndex = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await indexRepo(trimmed);
      const msg =
        data.status === "already_indexed"
          ? `"${data.repo_name}" is already indexed.`
          : `"${data.repo_name}" indexed — ${data.files_indexed} files, ${data.chunks_created} chunks.`;
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
    <div className="index-page">
      <div className="index-page__body">

        {/* Hero */}
        <section>
          <p className="index-hero__eyebrow">Local · Private · No API Keys</p>
          <h1 className="index-hero__h1">
            Chat with any<br />GitHub repository
          </h1>
          {/*<p className="index-hero__sub">*/}
          {/*  Paste a public GitHub URL. Code is chunked, embedded, and stored*/}
          {/*  locally — ask questions and get answers with exact file &amp; line citations.*/}
          {/*</p>*/}
          {/*<div className="index-hero__chips">*/}
          {/*  {["DeepSeek-Coder-V2", "Hybrid RAG", "Cross-encoder Rerank", "100% Local"].map((label) => (*/}
          {/*    <span key={label} className="chip">{label}</span>*/}
          {/*  ))}*/}
          {/*</div>*/}
        </section>

        {/* Input card */}
        <div className="card index-input-card">
          <label className="index-input-card__label">GitHub Repository URL</label>
          <div className="index-input-card__row">
            <div className="input-wrap" style={{ flex: 1 }}>
              <span className="input-wrap__prefix">github.com/</span>
              <input
                className="input-wrap__field"
                placeholder="owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <button
              className="btn btn--primary"
              onClick={handleIndex}
              disabled={loading || !url.trim()}
            >
              {loading ? "Indexing…" : "Index →"}
            </button>
          </div>
          {/*<p className="index-input-card__hint">*/}
          {/*  First index downloads the embedding model (~130 MB, one-time only).*/}
          {/*</p>*/}
        </div>

        {/* Progress */}
        {loading && (
          <div className="card index-progress">
            <div className="spinner" />
            <div>
              <p className="index-progress__text-title">Processing repository…</p>
              <p className="index-progress__text-sub">Cloning · chunking · embedding — this may take a minute</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="banner banner--error">
            <span style={{ flexShrink: 0 }}>✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="banner banner--success">
            <span style={{ flexShrink: 0 }}>✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Previously indexed */}
        {repos.length > 0 && (
          <section>
            <div className="divider-label index-repos__divider">Previously indexed</div>
            <div className="repo-grid">
              {repos.map((name) => (
                <RepoCard key={name} name={name} onClick={() => onSelectRepo(name)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
