import React from "react";

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M7.5 1C4.12 1 1.5 3.62 1.5 7c0 2.65 1.72 4.9 4.1 5.69.3.055.41-.13.41-.29v-1.02c-1.67.36-2.02-.8-2.02-.8-.273-.7-.667-.88-.667-.88-.545-.37.041-.36.041-.36.603.04.92.62.92.62.534.92 1.4.65 1.74.5.054-.39.21-.65.38-.8-1.33-.15-2.73-.67-2.73-2.96 0-.655.235-1.19.617-1.61-.062-.15-.268-.76.06-1.59 0 0 .503-.16 1.647.615A5.74 5.74 0 017.5 4.75a5.74 5.74 0 011.5.2c1.145-.775 1.647-.615 1.647-.615.328.83.122 1.44.06 1.59.384.42.617.955.617 1.61 0 2.3-1.403 2.81-2.74 2.96.215.185.407.55.407 1.11v1.64c0 .16.11.35.41.29A6 6 0 0013.5 7c0-3.38-2.62-6-6-6z"
        fill="var(--ink-4)"
      />
    </svg>
  );
}

export default function RepoCard({ name, onClick }) {
  return (
    <button className="repo-card" onClick={onClick}>
      <div className="repo-card__icon">
        <GithubIcon />
      </div>
      <p className="repo-card__name">{name}</p>
      <p className="repo-card__action">Open chat →</p>
    </button>
  );
}
