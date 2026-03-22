import React, { useState } from "react";

function FileIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 1h5l3 3v7H2V1z" stroke="var(--ink-4)" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      <path d="M7 1v3h3" stroke="var(--ink-4)" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 13 13" fill="none"
      className={`citation__chevron${open ? " citation__chevron--open" : ""}`}
    >
      <path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CitationBlock({ citation }) {
  const [open, setOpen] = useState(false);
  const lineCount = citation.end_line - citation.start_line + 1;
  const ext = citation.file_path.split(".").pop()?.toUpperCase() ?? "";

  return (
    <div className="citation">
      <button
        className={`citation__header${open ? " citation__header--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="citation__path">
          <FileIcon />
          <span className="citation__path-text">{citation.file_path}</span>
        </div>
        <div className="citation__meta">
          <span className="citation__badge">L{citation.start_line}–{citation.end_line}</span>
          <span className="citation__lines">{lineCount} line{lineCount !== 1 ? "s" : ""}</span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="citation__body">
          <div className="citation__toolbar">
            <span className="citation__toolbar-label">Snippet</span>
            <span className="citation__toolbar-lang">.{ext}</span>
          </div>
          <pre className="citation__code">
            <code>{citation.snippet}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
