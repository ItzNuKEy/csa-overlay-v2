import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div className="flex items-center gap-3">
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
      <button
        onClick={logout}
        className="
          px-3 py-1
          text-xs
          bg-red-500/20
          hover:bg-red-500/30
          text-red-200
          rounded
          transition-colors
        "
      >
        Logout
      </button>
    </div>
  );
}

