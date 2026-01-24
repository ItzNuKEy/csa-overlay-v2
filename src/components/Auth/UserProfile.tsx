import { useAuth } from "../../contexts/AuthContext";
import { FiUsers } from "react-icons/fi";

export function UserProfile() {
  const { user, logout, canManageUsers } = useAuth();

  if (!user) return null;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  const handleOpenUserManagement = async () => {
    // Double-check permissions before opening (security)
    if (user && window.auth?.canManageUsers) {
      const hasPermission = await window.auth.canManageUsers(user.id);
      if (!hasPermission) {
        alert("You do not have permission to manage users.");
        return;
      }
    }
    // Pass user ID for server-side validation
    await window.userManagement?.open(user?.id);
  };

  return (
    <div className="flex items-center gap-3 z-99">
      <div className="flex items-center gap-2">
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-white/90 text-sm font-medium">
          {user.username}
        </span>
      </div>
      {canManageUsers && (
        <button
          onClick={handleOpenUserManagement}
          className="px-3 py-1 text-xs bg-blue-500/30 hover:bg-blue-500 text-blue-100 flex items-center gap-1.5 transition-colors"
          title="Admin">
          <span>Admin</span>
        </button>
      )}
      <button
        onClick={logout}
        className="
          px-3 py-1
          text-xs
          bg-red-500/30
          hover:bg-red-500/90
          text-red-100
          transition-colors
        "
      >
        Logout
      </button>
    </div>
  );
}

