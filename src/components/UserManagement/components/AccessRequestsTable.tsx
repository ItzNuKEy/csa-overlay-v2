import type { AccessRequest } from "../types";

interface AccessRequestsTableProps {
  requests: AccessRequest[];
  loading: boolean;
  onRefresh: () => void;
  onApprove: (discordId: string) => void;
  onDeny: (discordId: string) => void;
}

export function AccessRequestsTable({
  requests,
  loading,
  onRefresh,
  onApprove,
  onDeny,
}: AccessRequestsTableProps) {
  return (
    <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Access Requests ({requests.length})
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 disabled:bg-blue-500/10 disabled:cursor-not-allowed text-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
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
            {loading ? (
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
                        onClick={() => onApprove(request.discord_id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onDeny(request.discord_id)}
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
  );
}
