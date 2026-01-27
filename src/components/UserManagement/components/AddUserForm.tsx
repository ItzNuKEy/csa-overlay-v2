import { useState, FormEvent } from "react";

interface AddUserFormProps {
  onSubmit: (discordId: string, username?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function AddUserForm({ onSubmit, isSubmitting }: AddUserFormProps) {
  const [discordId, setDiscordId] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(discordId, username || undefined);
    setDiscordId("");
    setUsername("");
  };

  return (
    <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Add New User</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-white/80 mb-2">Discord ID *</label>
          <input
            type="text"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="123456789012345678"
            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            required
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-white/80 mb-2">Username (optional)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username#1234"
            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
}
