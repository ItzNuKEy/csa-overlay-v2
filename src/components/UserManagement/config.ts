export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
}

/**
 * Get and validate API configuration from environment variables
 * @returns Validated API configuration
 */
export function getApiConfig(): ApiConfig {
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const apiKey = import.meta.env.VITE_API_KEY || "";

  // Validate API_URL is a valid HTTP/HTTPS URL (not a database connection string)
  if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    console.error("[UserManagement] Invalid VITE_API_URL - must be an HTTP/HTTPS URL, got:", apiUrl);
    console.error("[UserManagement] Please check your .env file and ensure VITE_API_URL is set to your API URL (e.g., http://localhost:8000)");
    // Fallback to localhost if invalid
    apiUrl = "http://localhost:8000";
    console.warn("[UserManagement] Using fallback URL:", apiUrl);
  }

  return {
    apiUrl,
    apiKey,
  };
}
