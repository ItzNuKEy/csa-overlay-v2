import { getApiConfig } from "../config";

interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  const config = getApiConfig();

  return (
    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
      <div className="font-semibold mb-2">Error: {error}</div>
      <div className="text-xs text-red-300/80 mt-2 space-y-1">
        <div>API URL: {config.apiUrl || "Not set"}</div>
        <div>API Key: {config.apiKey ? `${config.apiKey.substring(0, 10)}...` : "Not set"}</div>
        <div className="mt-2">Troubleshooting:</div>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Make sure your FastAPI backend is running on {config.apiUrl}</li>
          <li>Check that VITE_API_URL and VITE_API_KEY are set in your .env file</li>
          <li>Verify the API key matches your backend configuration</li>
          <li>Check the browser console (F12) for more details</li>
        </ul>
      </div>
    </div>
  );
}
