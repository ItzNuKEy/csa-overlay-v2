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
        flex items-center justify-center
        bg-linear-to-br from-csabg-500 via-csabg-400 to-csab-500
      "
    >
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
            Welcome to CSA Overlay
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
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127c.54.319 1.1.6 1.872.89a.077.077 0 0 0 .043.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Sign in with Discord</span>
            </>
          )}
        </button>

        <p className="text-xs text-white/50 text-center mt-4">
          A browser window will open for authentication
        </p>
      </div>
    </div>
  );
}

