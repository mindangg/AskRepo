from config import CHUNK_SIZE_TOKENS, CHUNK_OVERLAP_TOKENS

EXTENSION_TO_LANGUAGE = {
    ".py": "python", ".js": "javascript", ".ts": "typescript",
    ".tsx": "typescript", ".jsx": "javascript", ".go": "go",
    ".java": "java", ".rs": "rust", ".cpp": "cpp", ".cc": "cpp",
    ".cxx": "cpp", ".c": "c", ".cs": "csharp", ".rb": "ruby",
    ".php": "php", ".swift": "swift", ".kt": "kotlin",
    ".scala": "scala", ".dart": "dart", ".lua": "lua",
    ".r": "r", ".m": "matlab", ".vue": "vue", ".svelte": "svelte",
    ".sql": "sql", ".graphql": "graphql", ".proto": "protobuf", ".md": "markdown"
}


def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return len(text) // 4


def chunk_file(file_data: dict, repo_name: str) -> list[dict]:
    """
    Split a file into chunks of ~CHUNK_SIZE_TOKENS tokens
    with CHUNK_OVERLAP_TOKENS overlap.
    Tracks start_line and end_line for each chunk.
    """
    content = file_data["content"]
    file_path = file_data["file_path"]
    extension = file_data["extension"]
    language = EXTENSION_TO_LANGUAGE.get(extension, "unknown")

    lines = content.splitlines()
    chunks = []

    # Build token-aware chunks by accumulating lines
    chunk_lines = []
    chunk_token_count = 0
    start_line = 1

    i = 0
    while i < len(lines):
        line = lines[i]
        line_tokens = _estimate_tokens(line) + 1  # +1 for newline

        if chunk_token_count + line_tokens > CHUNK_SIZE_TOKENS and chunk_lines:
            # Save current chunk
            chunk_text = "\n".join(chunk_lines)
            end_line = start_line + len(chunk_lines) - 1
            chunks.append({
                "content": chunk_text,
                "file_path": file_path,
                "start_line": start_line,
                "end_line": end_line,
                "language": language,
                "repo_name": repo_name
            })

            # Calculate overlap: step back CHUNK_OVERLAP_TOKENS worth of lines
            overlap_tokens = 0
            overlap_lines = []
            for line_back in reversed(chunk_lines):
                lt = _estimate_tokens(line_back) + 1
                if overlap_tokens + lt > CHUNK_OVERLAP_TOKENS:
                    break
                overlap_lines.insert(0, line_back)
                overlap_tokens += lt

            # Restart from overlap
            chunk_lines = overlap_lines
            chunk_token_count = overlap_tokens
            start_line = end_line - len(overlap_lines) + 1
        else:
            chunk_lines.append(line)
            chunk_token_count += line_tokens
            i += 1

    # Final chunk
    if chunk_lines:
        chunk_text = "\n".join(chunk_lines)
        end_line = start_line + len(chunk_lines) - 1
        chunks.append({
            "content": chunk_text,
            "file_path": file_path,
            "start_line": start_line,
            "end_line": end_line,
            "language": language,
            "repo_name": repo_name
        })

    return chunks


def chunk_all_files(files: list[dict], repo_name: str) -> list[dict]:
    """Chunk all collected files."""
    all_chunks = []
    for file_data in files:
        chunks = chunk_file(file_data, repo_name)
        all_chunks.extend(chunks)
    return all_chunks