const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types matching the backend schema
export interface BackendTask {
  id: string;
  project_id: string | null;
  title: string;
  description: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved";
  context: Record<string, unknown>;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error ${response.status}`);
  }
  return response.json();
}

// --- Mock data for offline / demo mode ---

const now = new Date().toISOString();

const MOCK_TASKS: Record<string, BackendTask> = {
  "1": {
    id: "1", project_id: "proj-1", title: "Choose database strategy",
    description: "The current system uses Oracle 11g. Decide between PostgreSQL migration or cloud-native alternative",
    category: "critical", status: "Open", context: {}, resolution: null, created_at: now, updated_at: now,
  },
  "2": {
    id: "2", project_id: "proj-1", title: "Define API compatibility layer",
    description: "47 external systems connect to the current SOAP API. Determine backward compatibility approach",
    category: "critical", status: "Open", context: {}, resolution: null, created_at: now, updated_at: now,
  },
  "3": {
    id: "3", project_id: "proj-1", title: "Authentication modernization",
    description: "Legacy system uses custom session tokens. Decide on OAuth2, SAML, or passkey approach",
    category: "important", status: "Open", context: {}, resolution: null, created_at: now, updated_at: now,
  },
  "4": {
    id: "4", project_id: "proj-1", title: "Data migration strategy",
    description: "22 years of transaction records. Define what migrates, what archives, what gets purged",
    category: "important", status: "Open", context: {}, resolution: null, created_at: now, updated_at: now,
  },
  "5": {
    id: "5", project_id: "proj-1", title: "User interface approach",
    description: "Decide on the frontend framework and rendering strategy for the new system",
    category: "ambiguity", status: "Resolved", context: {}, resolution: "Adopted React SPA for modern frontend flexibility.", created_at: now, updated_at: now,
  },
  "6": {
    id: "6", project_id: "proj-1", title: "Monitoring and observability",
    description: "Select the monitoring stack and define SLOs for the new platform",
    category: "ambiguity", status: "Resolved", context: {}, resolution: "Implementation of Prometheus/Grafana stack approved.", created_at: now, updated_at: now,
  },
};

const MOCK_INITIAL_QUESTIONS: Record<string, string> = {
  "1": "I've reviewed the current Oracle 11g setup. Before we decide on a migration path, could you tell me: what are the primary performance bottlenecks you're experiencing today, and are there any Oracle-specific features (e.g. PL/SQL stored procedures, materialized views) that the team relies on heavily?",
  "2": "I see there are 47 external integrations on the SOAP API. To determine the right compatibility approach, I need to understand: how many of those consumers are internal vs. third-party, and is there a timeline by which external partners could migrate to a REST or gRPC endpoint?",
  "3": "The custom session token system presents several security risks. To recommend the right modern auth approach: does the organization already use an identity provider (like Azure AD, Okta), and do you need to support SSO across multiple internal applications?",
  "4": "22 years of transaction data is significant. A few key questions: are there regulatory or compliance requirements that mandate specific retention periods, and what percentage of queries actually touch records older than 5 years?",
  "5": "This task has been resolved. The team adopted React SPA for modern frontend flexibility.",
  "6": "This task has been resolved. Prometheus/Grafana stack has been approved for implementation.",
};

const MOCK_AGENT_REPLIES: string[] = [
  "Thank you for that context. Based on what you've shared, I'd recommend we consider a phased approach. Could you also clarify whether there are any hard deadlines or compliance milestones that would constrain our timeline?",
  "That's very helpful. Given those constraints, I think we can narrow this down to two viable options. Before I lay them out, one more question: what's the team's current expertise level with the technologies involved, and is there budget for training or external consultants?",
  "Understood. I now have a clear picture of the requirements. Let me summarize what I've gathered and propose a concrete recommendation. Does the team have a preference for build-vs-buy when it comes to the supporting tooling?",
  "Great point. That aligns with the patterns I've seen in similar migrations. I think we have enough information to draft a resolution. Would you like me to summarize the decision with specific technical choices and next steps?",
  "I appreciate the detailed explanation. To finalize my recommendation, could you confirm the expected load characteristics? Specifically, peak concurrent users and average request throughput during business hours.",
];

let mockReplyIndex = 0;

function getMockAgentReply(): string {
  const reply = MOCK_AGENT_REPLIES[mockReplyIndex % MOCK_AGENT_REPLIES.length];
  mockReplyIndex++;
  return reply;
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
export async function getTasks(projectId?: string, status?: string): Promise<BackendTask[]> {
  try {
    const params = new URLSearchParams();
    if (projectId) params.set("project_id", projectId);
    if (status) params.set("status", status);

    const response = await fetch(`${API_BASE}/tasks?${params}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // fall through to mock
  }
  return Object.values(MOCK_TASKS);
}

export async function getTask(taskId: string): Promise<BackendTask> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.id) return data;
    }
  } catch {
    // fall through to mock
  }
  const mock = MOCK_TASKS[taskId];
  if (mock) return mock;
  throw new Error("Task not found");
}

export async function sendTaskMessage(taskId: string, content: string) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (response.ok) return await response.json();
  } catch {
    // fall through to mock
  }
  await new Promise((r) => setTimeout(r, 800));
  return {
    task_id: taskId,
    user_message: content,
    agent_reply: getMockAgentReply(),
  };
}

export async function resolveTask(taskId: string, resolution: string) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    if (response.ok) return await response.json();
  } catch {
    // fall through to mock
  }
  const mock = MOCK_TASKS[taskId];
  if (mock) {
    mock.status = "Resolved";
    mock.resolution = resolution;
  }
  return mock || { id: taskId, status: "Resolved", resolution };
}

export interface Conversation {
  id: string;
  question: string;
  answer: string;
  status: string;
}

export async function getTaskConversations(taskId: string): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/conversations`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // fall through to mock
  }
  const initialQuestion = MOCK_INITIAL_QUESTIONS[taskId];
  if (initialQuestion && MOCK_TASKS[taskId]?.status !== "Resolved") {
    return [
      {
        id: `mock-init-${taskId}`,
        question: "",
        answer: initialQuestion,
        status: "pending",
      },
    ];
  }
  return [];
}
