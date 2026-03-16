from dotenv import load_dotenv
import os

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
REPOS_PATH = os.getenv("REPOS_PATH", "./cloned_repos")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "deepseek-coder:6.7b")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "repo_rag")

SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".java", ".rs",
    ".cpp", ".cc", ".cxx", ".c", ".cs", ".rb", ".php", ".swift",
    ".kt", ".scala", ".dart", ".lua", ".r", ".m", ".vue", ".svelte",
    ".sql", ".graphql", ".proto", ".md"
}

IGNORED_DIRS = {
    "node_modules", ".git", "dist", "build", "venv",
    "__pycache__", ".venv", ".mypy_cache", ".pytest_cache",
    "coverage", ".next", ".nuxt", "target", "out"
}

CHUNK_SIZE_TOKENS = 1200
CHUNK_OVERLAP_TOKENS = 200
TOP_K_RETRIEVAL = 10
TOP_K_FINAL = 6