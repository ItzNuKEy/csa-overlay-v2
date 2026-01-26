import React, { useState, useEffect } from "react";

// Get API URL and validate it
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

// Validate API_URL is a valid HTTP/HTTPS URL (not a database connection string)
if (!API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
  console.error("[UserManagement] Invalid VITE_API_URL - must be an HTTP/HTTPS URL, got:", API_URL);
  console.error("[UserManagement] Please check your .env file and ensure VITE_API_URL is set to your API URL (e.g., http://localhost:8000)");
  // Fallback to localhost if invalid
  API_URL = "http://localhost:8000";
  console.warn("[UserManagement] Using fallback URL:", API_URL);
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDiscordId, setNewDiscordId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  
  // Filter state
  const [filterAdmins, setFilterAdmins] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  
  // Requests state
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Debug logging
      console.log("[UserManagement] Fetching users from:", `${API_URL}/users`);
      console.log("[UserManagement] API_KEY set:", !!API_KEY, API_KEY ? `${API_KEY.substring(0, 10)}...` : "empty");

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error("[UserManagement] API error:", response.status, errorText);
        throw new Error(`Failed to fetch users (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("[UserManagement] Received users:", data);
      setUsers(data);
    } catch (err: any) {
      console.error("[UserManagement] Failed to fetch users:", err);
      
      // More detailed error message
      let errorMessage = "Failed to fetch users";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = `Cannot connect to API at ${API_URL}. Is your backend server running?`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (discordId: string, username?: string) => {
    if (!discordId.trim()) {
      setError("Discord ID is required");
      return;
    }

    setAddingUser(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ discord_id: discordId, username: username || null }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Failed to add user: ${response.statusText}`);
      }

      setNewDiscordId("");
      setNewUsername("");
      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to add user:", err);
      setError(err.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  const toggleUser = async (discordId: string, isActive: boolean) => {
    try {
      const response = await fetch(`${API_URL}/users/${discordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err.message || "Failed to update user");
    }
  };

  const toggleManagementPermission = async (discordId: string, canManage: boolean) => {
    try {
      const response = await fetch(`${API_URL}/users/${discordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ can_manage_users: !canManage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Failed to update management permission: ${response.statusText}`);
      }

      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to update management permission:", err);
      setError(err.message || "Failed to update management permission");
    }
  };

  const deleteUser = async (discordId: string) => {
    if (!confirm(`Are you sure you want to delete user ${discordId}?`)) return;

    try {
      const response = await fetch(`${API_URL}/users/${discordId}`, {
        method: "DELETE",
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      await fetchUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setError(err.message || "Failed to delete user");
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newDiscordId, newUsername || undefined);
  };

  // Filter users based on active filters
  const filteredUsers = users.filter((user) => {
    if (filterAdmins && !user.can_manage_users) return false;
    if (filterActive && !user.is_active) return false;
    return true;
  });

  const fetchRequests = async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/access-requests?status=pending`, {
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error("[UserManagement] API error fetching requests:", response.status, errorText);
        throw new Error(`Failed to fetch access requests (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      // Handle paginated response
      const items = data.items || data;
      setRequests(items);
    } catch (err: any) {
      console.error("[UserManagement] Failed to fetch requests:", err);
      setError(err.message || "Failed to fetch access requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (discordId: string) => {
    if (!confirm(`Are you sure you want to approve access request for ${discordId}?`)) return;

    try {
      setError(null);
      const response = await fetch(`${API_URL}/access-requests/${discordId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Failed to approve request: ${response.statusText}`);
      }

      // Refresh requests list and users list
      await fetchRequests();
      await fetchUsers();
    } catch (err: any) {
      console.error("[UserManagement] Failed to approve request:", err);
      setError(err.message || "Failed to approve access request");
    }
  };

  const handleDenyRequest = async (discordId: string) => {
    if (!confirm(`Are you sure you want to deny access request for ${discordId}?`)) return;

    try {
      setError(null);
      const response = await fetch(`${API_URL}/access-requests/${discordId}/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Failed to deny request: ${response.statusText}`);
      }

      // Refresh requests list
      await fetchRequests();
    } catch (err: any) {
      console.error("[UserManagement] Failed to deny request:", err);
      setError(err.message || "Failed to deny access request");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500">
        <div className="text-white/80 text-sm tracking-wide">Loading users...</div>
      </div>
    );
  }

  const handleOpenApiDocs = () => {
    window.shell?.openExternal("https://media.playcsa.com/docs#/");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500 p-6 overflow-auto">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <button
            onClick={handleOpenApiDocs}
            className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            title="Open API Documentation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>API Docs</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "users"
                ? "text-white border-b-2 border-blue-500"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "requests"
                ? "text-white border-b-2 border-blue-500"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Requests
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            <div className="font-semibold mb-2">Error: {error}</div>
            <div className="text-xs text-red-300/80 mt-2 space-y-1">
              <div>API URL: {API_URL || "Not set"}</div>
              <div>API Key: {API_KEY ? `${API_KEY.substring(0, 10)}...` : "Not set"}</div>
              <div className="mt-2">Troubleshooting:</div>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Make sure your FastAPI backend is running on {API_URL}</li>
                <li>Check that VITE_API_URL and VITE_API_KEY are set in your .env file</li>
                <li>Verify the API key matches your backend configuration</li>
                <li>Check the browser console (F12) for more details</li>
              </ul>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Filter Buttons */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterAdmins(!filterAdmins)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterAdmins
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600/30 text-white/70 hover:bg-gray-600/50"
                }`}
              >
                Admins
              </button>
              <button
                onClick={() => setFilterActive(!filterActive)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600/30 text-white/70 hover:bg-gray-600/50"
                }`}
              >
                Active Users
              </button>
            </div>

            {/* Add User Form */}
            <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Add New User</h2>
              <form onSubmit={handleAddUser} className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-white/80 mb-2">Discord ID *</label>
                  <input
                    type="text"
                    value={newDiscordId}
                    onChange={(e) => setNewDiscordId(e.target.value)}
                    placeholder="123456789012345678"
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-white/80 mb-2">Username (optional)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="username#1234"
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {addingUser ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">
                  Users ({filteredUsers.length}{filterAdmins || filterActive ? ` of ${users.length}` : ""})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Discord ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Management</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                          {users.length === 0 ? "No users found" : "No users match the selected filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.discord_id} className="border-t border-white/10 hover:bg-black/20">
                          <td className="px-4 py-3 text-white font-mono text-sm">{user.discord_id}</td>
                          <td className="px-4 py-3 text-white/90">{user.username || <span className="text-white/40">—</span>}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                user.is_active
                                  ? "bg-green-500/20 text-green-300 border border-green-500/50"
                                  : "bg-red-500/20 text-red-300 border border-red-500/50"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                user.can_manage_users
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                  : "bg-gray-500/20 text-gray-300 border border-gray-500/50"
                              }`}
                            >
                              {user.can_manage_users ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end flex-wrap">
                              <button
                                onClick={() => toggleUser(user.discord_id, user.is_active)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  user.is_active
                                    ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50"
                                    : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50"
                                }`}
                              >
                                {user.is_active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => toggleManagementPermission(user.discord_id, user.can_manage_users)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  user.can_manage_users
                                    ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/50"
                                    : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50"
                                }`}
                                title={user.can_manage_users ? "Revoke management permissions" : "Grant management permissions"}
                              >
                                {user.can_manage_users ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button
                                onClick={() => deleteUser(user.discord_id)}
                                className="px-3 py-1 rounded text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Access Requests ({requests.length})
              </h2>
              <button
                onClick={fetchRequests}
                disabled={loadingRequests}
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 disabled:bg-blue-500/10 disabled:cursor-not-allowed text-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {loadingRequests ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Discord ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Requested</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRequests ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                        Loading access requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-white/60">
                        No pending access requests
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.discord_id} className="border-t border-white/10 hover:bg-black/20">
                        <td className="px-4 py-3 text-white font-mono text-sm">{request.discord_id}</td>
                        <td className="px-4 py-3 text-white/90">
                          {request.username || <span className="text-white/40">—</span>}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {new Date(request.requested_at).toLocaleDateString()} {new Date(request.requested_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveRequest(request.discord_id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDenyRequest(request.discord_id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 transition-colors"
                            >
                              Deny
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
