const BASE_URL = "http://localhost:8000";

export async function indexRepo(githubUrl) {
    const resp = await fetch(`${BASE_URL}/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubUrl }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail?.error || "Indexing failed");
    return data;
}

export async function chat(question, repoName) {
    const resp = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, repo_name: repoName }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail?.error || "Chat failed");
    return data;
}

export async function fetchRepos() {
    const resp = await fetch(`${BASE_URL}/repos`);
    const data = await resp.json();
    if (!resp.ok) throw new Error("Failed to fetch repos");
    return data.repos;
}