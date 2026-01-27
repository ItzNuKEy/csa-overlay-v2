interface UserFiltersProps {
  filterAdmins: boolean;
  filterActive: boolean;
  onToggleAdmins: () => void;
  onToggleActive: () => void;
}

export function UserFilters({
  filterAdmins,
  filterActive,
  onToggleAdmins,
  onToggleActive,
}: UserFiltersProps) {
  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <button
        onClick={onToggleAdmins}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterAdmins
            ? "bg-blue-500 text-white"
            : "bg-gray-600/30 text-white/70 hover:bg-gray-600/50"
        }`}
      >
        Admins
      </button>
      <button
        onClick={onToggleActive}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filterActive
            ? "bg-blue-500 text-white"
            : "bg-gray-600/30 text-white/70 hover:bg-gray-600/50"
        }`}
      >
        Active Users
      </button>
    </div>
  );
}
