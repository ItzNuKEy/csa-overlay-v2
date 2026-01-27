import { app } from "electron";
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file (same logic as discordAuth.ts)
function loadEnvFile() {
  let envPath: string | null = null;
  
  try {
    if (app && app.isPackaged && process.resourcesPath) {
      const resourcesEnvPath = path.join(process.resourcesPath, ".env");
      if (fs.existsSync(resourcesEnvPath)) {
        envPath = resourcesEnvPath;
      }
    }
  } catch (err) {
    // Continue to other options
  }

  if (!envPath) {
    try {
      if (app) {
        const userDataEnvPath = path.join(app.getPath("userData"), ".env");
        if (fs.existsSync(userDataEnvPath)) {
          envPath = userDataEnvPath;
        }
      }
    } catch (err) {
      // App might not be available yet
    }
  }

  if (!envPath) {
    const projectRootEnvPath = path.resolve(__dirname, "..", ".env");
    if (fs.existsSync(projectRootEnvPath)) {
      envPath = projectRootEnvPath;
    }
  }

  if (envPath) {
    config({ path: envPath });
    console.log(`[userManagementApi] Loaded .env from: ${envPath}`);
    return true;
  } else {
    config();
    return false;
  }
}

loadEnvFile();

// Get API URL and key
function getApiConfig() {
  let API_URL = process.env.CSA_MEDIA_API_URL || process.env.VITE_API_URL;
  const API_KEY = process.env.CSA_MEDIA_API_KEY || process.env.VITE_API_KEY || "";

  if (!API_URL) {
    if (app && !app.isPackaged) {
      API_URL = "http://localhost:8000";
      console.log("[userManagementApi] Using default API URL for development:", API_URL);
    } else {
      throw new Error("CSA_MEDIA_API_URL or VITE_API_URL not set. Please configure it in your .env file.");
    }
  }

  if (!API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
    throw new Error(`Invalid API URL - must be an HTTP/HTTPS URL, got: ${API_URL}`);
  }

  return {
    apiUrl: API_URL.replace(/\/$/, ""),
    apiKey: API_KEY,
  };
}

interface User {
  discord_id: string;
  username: string | null;
  is_active: boolean;
  can_manage_users: boolean;
  created_at: string;
}

interface AccessRequest {
  discord_id: string;
  username: string | null;
  requested_at: string;
  status?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
}

/**
 * Make API request from main process (no CORS issues)
 */
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
  } = {}
): Promise<T> {
  const config = getApiConfig();
  const url = `${config.apiUrl}${endpoint}`;

  const headers: HeadersInit = {
    "X-API-Key": config.apiKey,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let errorMessage = `API request failed (${response.status}): ${errorText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Use the errorMessage as is
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return await response.json();
}

export async function fetchUsers(): Promise<User[]> {
  return await apiRequest<User[]>("/users");
}

export async function createUser(discordId: string, username?: string): Promise<User> {
  return await apiRequest<User>("/users", {
    method: "POST",
    body: {
      discord_id: discordId,
      username: username || null,
    },
  });
}

export async function updateUser(
  discordId: string,
  updates: {
    is_active?: boolean;
    can_manage_users?: boolean;
    username?: string;
  }
): Promise<User> {
  return await apiRequest<User>(`/users/${discordId}`, {
    method: "PATCH",
    body: updates,
  });
}

export async function deleteUser(discordId: string): Promise<void> {
  return await apiRequest<void>(`/users/${discordId}`, {
    method: "DELETE",
  });
}

export async function fetchAccessRequests(status?: "pending" | "approved" | "denied"): Promise<AccessRequest[]> {
  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }

  const endpoint = `/access-requests${params.toString() ? `?${params.toString()}` : ""}`;
  const data = await apiRequest<{ items?: AccessRequest[] } | AccessRequest[]>(endpoint);
  
  // Handle paginated response
  if (Array.isArray(data)) {
    return data;
  }
  return data.items || [];
}

export async function approveAccessRequest(discordId: string, notes?: string): Promise<User> {
  return await apiRequest<User>(`/access-requests/${discordId}/approve`, {
    method: "POST",
    body: notes ? { notes } : {},
  });
}

export async function denyAccessRequest(discordId: string, notes?: string): Promise<AccessRequest> {
  return await apiRequest<AccessRequest>(`/access-requests/${discordId}/deny`, {
    method: "POST",
    body: notes ? { notes } : {},
  });
}
