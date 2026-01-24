import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate with Discord");
    }
  };

  return (
    <div
      className="
        h-screen w-screen
        flex flex-col
      "
    >
      
      <div className="flex-1 flex items-center justify-center">
      <div
        className="
          bg-csabg-300
          rounded-lg
          p-8
          shadow-2xl
          max-w-md
          w-full
          mx-4
          border border-csabg-200
        "
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            CSA Caster Production Kit
          </h1>
          <p className="text-white/70">
            Please sign in with Discord to continue
          </p>
        </div>

        {error && (
          <div
            className="
              mb-4
              p-3
              bg-red-500/20
              border border-red-500/50
              rounded
              text-red-200
              text-sm
            "
          >
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="
            w-full
            py-3
            px-4
            bg-discord-500
            hover:bg-discord-600
            disabled:bg-discord-500/50
            disabled:cursor-not-allowed
            text-white
            font-semibold
            rounded-lg
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-6 h-6" viewBox="0 0 16 16">
  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
</svg>
              <span>Sign in with Discord</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            // Placeholder - no functionality yet
            console.log("Request Access clicked");
          }}
          className="
            w-full
            py-3
            px-4
            mt-3
            bg-white/10
            hover:bg-white/20
            text-white
            font-semibold
            rounded-lg
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          Request Access
        </button>

        {/* Access denied error message - shown below buttons */}
        {error && (error.includes("access") || error.includes("not authorized") || error.includes("does not have")) && (
          <p className="text-sm text-red-400 text-center mt-4">
            You do not have access. Please request access to gain access.
          </p>
        )}

        <p className="text-xs text-white/50 text-center mt-4">
          A browser window will open for authentication
        </p>
      </div>
      </div>
    </div>
  );
}

