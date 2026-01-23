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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDiscordId, setNewDiscordId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500">
        <div className="text-white/80 text-sm tracking-wide">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500 p-6 overflow-auto">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>

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
            <h2 className="text-xl font-semibold text-white">Users ({users.length})</h2>
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
      </div>
    </div>
  );
}
