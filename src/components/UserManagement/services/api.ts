import type { User, AccessRequest } from "../types";

/**
 * Check if we're running in Electron (have access to IPC)
 */
function isElectron(): boolean {
  return typeof window !== "undefined" && typeof window.userManagementApi !== "undefined";
}

/**
 * Fetch all users from the API
 */
export async function fetchUsers(): Promise<User[]> {
  if (isElectron() && window.userManagementApi) {
    console.log("[API] Using Electron IPC to fetch users");
    return await window.userManagementApi.fetchUsers();
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Create a new user
 */
export async function createUser(discordId: string, username?: string): Promise<User> {
  if (!discordId.trim()) {
    throw new Error("Discord ID is required");
  }

  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.createUser(discordId, username);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Update a user's properties
 */
export async function updateUser(
  discordId: string,
  updates: {
    is_active?: boolean;
    can_manage_users?: boolean;
    username?: string;
  }
): Promise<User> {
  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.updateUser(discordId, updates);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Delete a user
 */
export async function deleteUser(discordId: string): Promise<void> {
  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.deleteUser(discordId);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Fetch access requests with optional status filter
 */
export async function fetchAccessRequests(status?: "pending" | "approved" | "denied"): Promise<AccessRequest[]> {
  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.fetchAccessRequests(status);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Approve an access request
 */
export async function approveAccessRequest(discordId: string, notes?: string): Promise<User> {
  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.approveAccessRequest(discordId, notes);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}

/**
 * Deny an access request
 */
export async function denyAccessRequest(discordId: string, notes?: string): Promise<AccessRequest> {
  if (isElectron() && window.userManagementApi) {
    return await window.userManagementApi.denyAccessRequest(discordId, notes);
  }
  
  throw new Error("User Management API is only available in Electron. Please use the Electron app.");
}
