import { useState, useRef } from "react";
import { UsersTab, type UsersTabRef } from "./components/UsersTab";
import { RequestsTab } from "./components/RequestsTab";
import { ErrorDisplay } from "./components/ErrorDisplay";

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [error, setError] = useState<string | null>(null);
  const usersTabRef = useRef<UsersTabRef>(null);

  const handleOpenApiDocs = () => {
    window.shell?.openExternal("https://media.playcsa.com/docs#/");
  };

  const handleUsersUpdate = () => {
    // Refresh users list when a request is approved
    if (usersTabRef.current) {
      usersTabRef.current.refresh();
    }
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

        <ErrorDisplay error={error} />

        {/* Tab Content */}
        {activeTab === "users" && <UsersTab ref={usersTabRef} onError={setError} />}
        {activeTab === "requests" && <RequestsTab onError={setError} onUsersUpdate={handleUsersUpdate} />}
      </div>
    </div>
  );
}
