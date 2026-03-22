import requests

from config import OLLAMA_BASE_URL, OLLAMA_MODEL

SYSTEM_PROMPT = """You are a code assistant answering questions about a GitHub repository.

STRICT RULES:
1. You MUST answer only using the provided CONTEXT.
2. You MUST NOT use prior knowledge.
3. You MUST NOT guess or infer missing information.
4. If the answer is not explicitly present in the context, respond exactly with:
   "The requested information was not found in the indexed repository."
5. Every answer MUST include citations in the following format:

File: <file_path>
Lines: <start_line>-<end_line>

Then provide the explanation.
If multiple files are used, cite each one separately."""


def check_ollama_available() -> bool:
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return resp.status_code == 200
    except Exception:
        return False


def build_context(chunks: list[dict]) -> str:
    context_parts = []
    for chunk in chunks:
        meta = chunk["metadata"]
        context_parts.append(
            f"--- File: {meta['file_path']} | Lines: {meta['start_line']}-{meta['end_line']} ---\n"
            f"{chunk['content']}\n"
        )
    return "\n".join(context_parts)


def generate_answer(question: str, chunks: list[dict]) -> dict:
    if not check_ollama_available():
        raise ConnectionError("Ollama service unavailable")

    context = build_context(chunks)
    user_prompt = f"""CONTEXT:
{context}

QUESTION: {question}

Answer strictly using the context above. Include file citations."""

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_ctx": 8192
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=180
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ConnectionError("Cannot connect to Ollama at " + OLLAMA_BASE_URL)
    except requests.exceptions.Timeout:
        raise TimeoutError("Ollama request timed out")
    except requests.exceptions.HTTPError as e:
        if "model not found" in str(e).lower() or response.status_code == 404:
            raise ValueError(f"Model '{OLLAMA_MODEL}' not found in Ollama")
        raise

    data = response.json()
    answer_text = data["message"]["content"]

    # Build citations from chunks used
    citations = []
    for chunk in chunks:
        meta = chunk["metadata"]
        citations.append({
            "file_path": meta["file_path"],
            "start_line": meta["start_line"],
            "end_line": meta["end_line"],
            "snippet": chunk["content"][:500] + ("..." if len(chunk["content"]) > 500 else "")
        })

    return {
        "answer": answer_text,
        "citations": citations
    }