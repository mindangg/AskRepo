from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ingestion.git_ingestor import clone_repository, collect_files
from chunking.chunker import chunk_all_files
from retrieval.retriever import (
    repo_already_indexed,
    store_chunks,
    hybrid_retrieve,
    get_all_indexed_repos,
)
from llm.ollama_client import generate_answer, check_ollama_available

router = APIRouter()

class IndexRequest(BaseModel):
    github_url: str

class ChatRequest(BaseModel):
    question: str
    repo_name: str

@router.post("/index")
async def index_repository(req: IndexRequest):
    try:
        repo_path, repo_name = clone_repository(req.github_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})

    # Check if already indexed
    if repo_already_indexed(repo_name):
        return {"status": "already_indexed", "repo_name": repo_name}

    # Collect files
    files = collect_files(repo_path)
    if not files:
        raise HTTPException(
            status_code=422,
            detail={"error": "No supported code files found in this repository"}
        )

    # Chunk
    chunks = chunk_all_files(files, repo_name)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail={"error": "No chunks could be generated from the repository files"}
        )

    # Store
    try:
        store_chunks(chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Storage error: {str(e)}"})

    return {
        "status": "indexed",
        "repo_name": repo_name,
        "files_indexed": len(files),
        "chunks_created": len(chunks)
    }

@router.post("/chat")
async def chat(req: ChatRequest):
    if not check_ollama_available():
        raise HTTPException(
            status_code=503,
            detail={"error": "LLM service unavailable, ensure Ollama is running"}
        )

    if not repo_already_indexed(req.repo_name):
        raise HTTPException(
            status_code=404,
            detail={"error": f"Repository '{req.repo_name}' has not been indexed yet"}
        )

    try:
        chunks = hybrid_retrieve(req.question, req.repo_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Retrieval error: {str(e)}"})

    if not chunks:
        return {
            "answer": "The requested information was not found in the indexed repository.",
            "citations": []
        }

    try:
        result = generate_answer(req.question, chunks)
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail={"error": str(e)})
    except TimeoutError:
        raise HTTPException(status_code=504, detail={"error": "LLM response timed out"})
    except ValueError as e:
        raise HTTPException(status_code=503, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"LLM error: {str(e)}"})

    return result


@router.get("/repos")
async def list_repos():
    repos = get_all_indexed_repos()
    return {"repos": repos}