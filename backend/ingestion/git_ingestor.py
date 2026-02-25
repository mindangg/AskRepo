import os
import subprocess
from pathlib import Path
from config import REPOS_PATH, SUPPORTED_EXTENSIONS, IGNORED_DIRS


def get_repo_name(github_url: str) -> str:
    """Extract repo name from GitHub URL."""
    url = github_url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    return url.split("/")[-1]


def clone_repository(github_url: str) -> tuple[str, str]:
    """
    Clone the GitHub repository if not already cloned.
    Returns (repo_path, repo_name).
    Raises ValueError on invalid URL, RuntimeError on clone failure.
    """
    if not github_url.startswith("https://github.com/"):
        raise ValueError(f"Invalid GitHub URL: {github_url}")

    repo_name = get_repo_name(github_url)
    os.makedirs(REPOS_PATH, exist_ok=True)
    repo_path = os.path.join(REPOS_PATH, repo_name)

    if os.path.exists(repo_path) and os.path.isdir(repo_path):
        # Already cloned — skip
        return repo_path, repo_name

    try:
        result = subprocess.run(
            ["git", "clone", "--depth=1", github_url, repo_path],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode != 0:
            stderr = result.stderr.strip()
            if "not found" in stderr.lower() or "repository" in stderr.lower():
                raise ValueError(f"Repository not found or is private: {github_url}")
            raise RuntimeError(f"Git clone failed: {stderr}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("Git clone timed out after 120 seconds")
    except FileNotFoundError:
        raise RuntimeError("git is not installed or not in PATH")

    return repo_path, repo_name


def collect_files(repo_path: str) -> list[dict]:
    """
    Walk the repo and collect all indexable files.
    Returns list of dicts with path and content.
    """
    files = []
    repo_path_obj = Path(repo_path)

    for root, dirs, filenames in os.walk(repo_path):
        # Prune ignored directories in-place
        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS and not d.startswith(".")
        ]

        for filename in filenames:
            ext = Path(filename).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            filepath = os.path.join(root, filename)
            try:
                with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                if not content.strip():
                    continue
                relative_path = str(Path(filepath).relative_to(repo_path_obj))
                files.append({
                    "file_path": relative_path,
                    "content": content,
                    "extension": ext
                })
            except Exception:
                continue

    return files