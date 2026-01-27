import type { User } from "../types";

interface UserTableProps {
  users: User[];
  filteredUsers: User[];
  onToggleActive: (discordId: string, isActive: boolean) => void;
  onToggleManagement: (discordId: string, canManage: boolean) => void;
  onDelete: (discordId: string) => void;
}

export function UserTable({
  users,
  filteredUsers,
  onToggleActive,
  onToggleManagement,
  onDelete,
}: UserTableProps) {
  return (
    <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">
          Users ({filteredUsers.length}{filteredUsers.length !== users.length ? ` of ${users.length}` : ""})
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
                  <td className="px-4 py-3 text-white/90">
                    {user.username || <span className="text-white/40">—</span>}
                  </td>
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
                        onClick={() => onToggleActive(user.discord_id, user.is_active)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          user.is_active
                            ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50"
                            : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50"
                        }`}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => onToggleManagement(user.discord_id, user.can_manage_users)}
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
                        onClick={() => onDelete(user.discord_id)}
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
  );
}
