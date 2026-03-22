import React, { useState, useEffect } from "react";
import IndexScreen from "./components/IndexScreen.jsx";
import ChatScreen from "./components/ChatScreen.jsx";
import { fetchRepos } from "./api/client.js";

function GridIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="4" height="4" rx="1" fill="white" />
      <rect x="8" y="2" width="4" height="4" rx="1" fill="white" opacity="0.5" />
      <rect x="2" y="8" width="4" height="4" rx="1" fill="white" opacity="0.5" />
      <rect x="8" y="8" width="4" height="4" rx="1" fill="white" opacity="0.25" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 6L6.5 1.5l5 4.5V11H8.5V8h-4v3H1.5V6z" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M11 1.5H2C1.72 1.5 1.5 1.72 1.5 2v7c0 .28.22.5.5.5h1.5v2l2.5-2H11c.28 0 .5-.22.5-.5V2c0-.28-.22-.5-.5-.5z" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [activeRepo, setActiveRepo] = useState(null);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetchRepos().then(setRepos).catch(() => {});
  }, []);

  const handleIndexed = (repoName) => {
    setRepos((prev) => (prev.includes(repoName) ? prev : [...prev, repoName]));
    setActiveRepo(repoName);
  };

  return (
    <div className="app-root">
      <header className="header">

        {/* Wordmark */}
        <div className="wordmark">
          <div className="wordmark__icon">
            <GridIcon />
          </div>
          <span className="wordmark__text">
            Ask<em>Repo</em>
          </span>
        </div>

        {/* Pill nav — centered */}
        <nav className="pill-nav" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <button
            className={`pill-nav__item${!activeRepo ? " pill-nav__item--active" : ""}`}
            onClick={() => setActiveRepo(null)}
          >
            <HomeIcon />
            Index
          </button>

          {activeRepo && (
            <button className="pill-nav__item pill-nav__item--active">
              <ChatIcon />
              <span className="pill-nav__item__mono">{activeRepo}</span>
            </button>
          )}
        </nav>

        {/* Right side */}
        <div>
          {activeRepo ? (
            <button className="btn btn--ghost btn--sm" onClick={() => setActiveRepo(null)}>
              ← Back
            </button>
          ) : (
            /* Empty placeholder to keep header balanced */
            <div style={{ width: 72 }} />
          )}
        </div>
      </header>

      <main className="app-main">
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
