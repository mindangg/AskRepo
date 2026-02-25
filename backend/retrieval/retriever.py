import chromadb
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder
from config import (
    CHROMA_PATH, COLLECTION_NAME, TOP_K_RETRIEVAL, TOP_K_FINAL
)
from embeddings.embedder import embed_query, embed_texts

_chroma_client = None
_cross_encoder = None


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    return _chroma_client


def get_cross_encoder():
    global _cross_encoder
    if _cross_encoder is None:
        _cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    return _cross_encoder


def get_or_create_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def repo_already_indexed(repo_name: str) -> bool:
    """Check if repo_name already has documents in ChromaDB."""
    collection = get_or_create_collection()
    results = collection.get(
        where={"repo_name": repo_name},
        limit=1
    )
    return len(results["ids"]) > 0


def get_all_indexed_repos() -> list[str]:
    """Return all unique repo names stored in ChromaDB."""
    collection = get_or_create_collection()
    try:
        results = collection.get(include=["metadatas"])
        repos = set()
        for meta in results["metadatas"]:
            if meta and "repo_name" in meta:
                repos.add(meta["repo_name"])
        return list(repos)
    except Exception:
        return []


def store_chunks(chunks: list[dict]):
    """Store chunks and their embeddings in ChromaDB."""
    collection = get_or_create_collection()

    texts = [c["content"] for c in chunks]
    embeddings = embed_texts(texts)

    ids = []
    metadatas = []
    documents = []

    for i, chunk in enumerate(chunks):
        chunk_id = f"{chunk['repo_name']}::{chunk['file_path']}::{chunk['start_line']}::{chunk['end_line']}::{i}"
        ids.append(chunk_id)
        metadatas.append({
            "file_path": chunk["file_path"],
            "start_line": chunk["start_line"],
            "end_line": chunk["end_line"],
            "language": chunk["language"],
            "repo_name": chunk["repo_name"]
        })
        documents.append(chunk["content"])

    # Batch insert to avoid memory issues
    batch_size = 100
    for start in range(0, len(ids), batch_size):
        end = start + batch_size
        collection.add(
            ids=ids[start:end],
            embeddings=embeddings[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end]
        )


def _normalize(scores: list[float]) -> list[float]:
    """Normalize scores to [0, 1]."""
    if not scores:
        return scores
    min_s = min(scores)
    max_s = max(scores)
    if max_s == min_s:
        return [1.0] * len(scores)
    return [(s - min_s) / (max_s - min_s) for s in scores]


def hybrid_retrieve(query: str, repo_name: str) -> list[dict]:
    """
    Hybrid retrieval: vector similarity + BM25, combined with weighted sum.
    Returns top chunks after cross-encoder reranking.
    """
    collection = get_or_create_collection()

    # --- Vector Search ---
    query_embedding = embed_query(query)
    vector_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=TOP_K_RETRIEVAL,
        where={"repo_name": repo_name},
        include=["documents", "metadatas", "distances"]
    )

    if not vector_results["ids"][0]:
        return []

    vec_docs = vector_results["documents"][0]
    vec_metas = vector_results["metadatas"][0]
    vec_ids = vector_results["ids"][0]
    # ChromaDB cosine distance: 0 = identical, 2 = opposite. Convert to similarity.
    vec_scores_raw = [1 - d for d in vector_results["distances"][0]]

    # --- BM25 Search ---
    # Fetch all docs for this repo (limit to reasonable number)
    all_docs_result = collection.get(
        where={"repo_name": repo_name},
        include=["documents", "metadatas"]
    )
    all_docs = all_docs_result["documents"]
    all_metas = all_docs_result["metadatas"]
    all_ids = all_docs_result["ids"]

    if not all_docs:
        return []

    tokenized_corpus = [doc.lower().split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized_corpus)
    bm25_scores_all = bm25.get_scores(query.lower().split())

    # Map id -> bm25 score
    id_to_bm25 = {all_ids[i]: bm25_scores_all[i] for i in range(len(all_ids))}

    # --- Combine Scores ---
    vec_scores_norm = _normalize(vec_scores_raw)

    # Get BM25 scores for vector-retrieved docs
    bm25_scores_for_vec = [id_to_bm25.get(vid, 0.0) for vid in vec_ids]
    bm25_scores_norm = _normalize(bm25_scores_for_vec)

    combined = []
    for i in range(len(vec_ids)):
        final_score = 0.6 * vec_scores_norm[i] + 0.4 * bm25_scores_norm[i]
        combined.append({
            "id": vec_ids[i],
            "content": vec_docs[i],
            "metadata": vec_metas[i],
            "score": final_score
        })

    # Sort by combined score descending
    combined.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = combined[:TOP_K_FINAL + 2]  # Fetch a few extra for reranker

    if not top_candidates:
        return []

    # --- Cross-Encoder Reranking ---
    cross_encoder = get_cross_encoder()
    pairs = [[query, c["content"]] for c in top_candidates]
    ce_scores = cross_encoder.predict(pairs)

    for i, c in enumerate(top_candidates):
        c["ce_score"] = float(ce_scores[i])

    top_candidates.sort(key=lambda x: x["ce_score"], reverse=True)
    return top_candidates[:TOP_K_FINAL]