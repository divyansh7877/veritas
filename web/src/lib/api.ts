const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error ${response.status}`);
  }
  return response.json();
}

// Ingestion API
export async function ingestGitHubRepo(repoUrl: string, branch = "main", projectId?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);

  const response = await fetch(
    `${API_BASE}/ingestion/sources/github?${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_url: repoUrl, branch }),
    }
  );
  return handleResponse(response);
}

export async function ingestDocumentation(files: File[], projectId?: string) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (projectId) formData.append("project_id", projectId);

  const response = await fetch(`${API_BASE}/ingestion/sources/docs`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}

export async function ingestSuggestions(prompts: string[], projectId?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);

  const response = await fetch(
    `${API_BASE}/ingestion/sources/suggestions?${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompts }),
    }
  );
  return handleResponse(response);
}

export async function analyzeProject(projectId?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);

  const response = await fetch(`${API_BASE}/ingestion/analyze?${params}`, {
    method: "POST",
  });
  return handleResponse(response);
}

// Tasks API
export async function getTasks(projectId?: string, status?: string): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);
  if (status) params.set("status", status);

  try {
    const response = await fetch(`${API_BASE}/tasks?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    // Re-throw with more context, but let dashboard handle fallback
    throw new Error(err instanceof Error ? err.message : "Failed to fetch tasks");
  }
}

export async function getTask(taskId: string) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}`);
  return handleResponse(response);
}

export async function sendTaskMessage(taskId: string, content: string) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
}

export async function resolveTask(taskId: string, resolution: string) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolution }),
  });
  return handleResponse(response);
}
