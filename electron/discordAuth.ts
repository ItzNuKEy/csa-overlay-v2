import http from "node:http";
import { URL } from "node:url";
import { shell, app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load .env file from multiple locations (in order of priority):
// 1. Resources directory (packaged app - .env bundled with app)
// 2. User's app data directory (user override)
// 3. Project root (for development)
// 4. Current working directory (fallback)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  let envPath: string | null = null;
  
  // Try resources directory first (for packaged apps - .env bundled with app)
  try {
    if (app && app.isPackaged && process.resourcesPath) {
      const resourcesEnvPath = path.join(process.resourcesPath, ".env");
      if (fs.existsSync(resourcesEnvPath)) {
        envPath = resourcesEnvPath;
      }
    }
  } catch (err) {
    // Continue to other options
  }

  // Try user data directory (allows user override of bundled .env)
  if (!envPath) {
    try {
      if (app) {
        const userDataEnvPath = path.join(app.getPath("userData"), ".env");
        if (fs.existsSync(userDataEnvPath)) {
          envPath = userDataEnvPath;
        }
      }
    } catch (err) {
      // App might not be available yet, continue to other options
    }
  }

  // Try project root (for development)
  if (!envPath) {
    const projectRootEnvPath = path.resolve(__dirname, "..", ".env");
    if (fs.existsSync(projectRootEnvPath)) {
      envPath = projectRootEnvPath;
    }
  }

  // Load .env file if found
  if (envPath) {
    config({ path: envPath });
    console.log(`[auth] Loaded .env from: ${envPath}`);
    return true;
  } else {
    // Try loading from current working directory (fallback)
    config();
    return false;
  }
}

// Load environment variables
loadEnvFile();
// Discord OAuth configuration
// Loaded from .env file or environment variables
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: DiscordUser;
  error?: string;
}

// Check if a Discord user ID has access via the new API
// According to API documentation: POST /auth/check returns { has_access: bool, can_manage_users: bool }
export async function isUserAllowed(discordId: string): Promise<boolean> {
  try {
    // Default to localhost for development, but require explicit config for production
    // Users should set CSA_MEDIA_API_URL in their .env file
    let API_URL = process.env.CSA_MEDIA_API_URL;
    
    if (!API_URL) {
      // Only use localhost default in development (unpackaged app)
      if (app && !app.isPackaged) {
        API_URL = "http://localhost:8000";
        console.log("[auth] Using default API URL for development:", API_URL);
      } else {
        console.error("[auth] CSA_MEDIA_API_URL not set. Please configure it in your .env file.");
        return false;
      }
    }
    
    // Validate that API_URL is a valid HTTP/HTTPS URL (not a database connection string)
    if (!API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
      console.error("[auth] Invalid CSA_MEDIA_API_URL - must be an HTTP/HTTPS URL, got:", API_URL);
      console.error("[auth] Please check your .env file and ensure CSA_MEDIA_API_URL is set to your API URL (e.g., http://localhost:8000)");
      // On configuration error, deny access for security
      return false;
    }
    
    // Remove trailing slash if present
    API_URL = API_URL.replace(/\/$/, "");
    
    // Call /auth/check endpoint as per API documentation
    // Endpoint: POST /auth/check
    // Request Body: { "discord_id": "123456789012345678" }
    // Response: { "has_access": true, "can_manage_users": false }
    const response = await fetch(`${API_URL}/auth/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ discord_id: discordId }),
    });

    if (!response.ok) {
      console.error("[auth] API request failed:", response.status, response.statusText);
      // On API error, deny access for security
      return false;
    }

    const data = await response.json();
    
    // According to API docs, response structure is:
    // { "has_access": true/false, "can_manage_users": true/false }
    // Returns true if user exists and is_active is true
    return data.has_access === true;
  } catch (err) {
    console.error("[auth] Error checking user access:", err);
    // On error, deny access for security
    return false;
  }
}

// Check if a Discord user ID can manage users (has admin/management permissions)
// According to API documentation: POST /auth/check returns { has_access: bool, can_manage_users: bool }
export async function canManageUsers(discordId: string): Promise<boolean> {
  try {
    // Default to localhost for development, but require explicit config for production
    let API_URL = process.env.CSA_MEDIA_API_URL;
    
    if (!API_URL) {
      // Only use localhost default in development (unpackaged app)
      if (app && !app.isPackaged) {
        API_URL = "http://localhost:8000";
      } else {
        console.error("[auth] CSA_MEDIA_API_URL not set. Please configure it in your .env file.");
        return false;
      }
    }
    
    // Validate that API_URL is a valid HTTP/HTTPS URL
    if (!API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
      console.error("[auth] Invalid CSA_MEDIA_API_URL - must be an HTTP/HTTPS URL, got:", API_URL);
      return false;
    }
    
    // Remove trailing slash if present
    API_URL = API_URL.replace(/\/$/, "");
    
    // Call /auth/check endpoint as per API documentation
    // Endpoint: POST /auth/check
    // Request: { "discord_id": "..." }
    // Response: { "has_access": bool, "can_manage_users": bool }
    const response = await fetch(`${API_URL}/auth/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ discord_id: discordId }),
    });

    if (!response.ok) {
      console.error("[auth] API request failed:", response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    
    // According to API docs, response structure is:
    // { "has_access": true/false, "can_manage_users": true/false }
    // User must have access AND management permissions
    if (data.has_access !== true) {
      return false;
    }
    
    // Return can_manage_users value (defaults to false if not present for security)
    return data.can_manage_users === true;
  } catch (err) {
    console.error("[auth] Error checking management permissions:", err);
    return false;
  }
}

// Clear cache (no-op for compatibility, cache removed with new API)
export function clearStaffMembersCache(): void {
  // No-op: cache removed with new API implementation
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Get user info from Discord API
async function getUserInfo(accessToken: string): Promise<DiscordUser> {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return await response.json();
}

// Start OAuth flow
export function startDiscordAuth(): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      reject({
        success: false,
        error: "Discord OAuth not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables.",
      });
      return;
    }

    // Find an available port starting from 3000
    let port = 3000;
    let server: http.Server | null = null;

    const tryListen = () => {
      server = http.createServer(async (req, res) => {
        if (!req.url) {
          res.writeHead(400);
          res.end("Bad Request");
          return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        
        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");
          const errorDescription = url.searchParams.get("error_description");

          if (error) {
            res.end(`<p>${error}</p><p>${errorDescription ?? ""}</p>`);
          }


          if (error) {
            res.writeHead(200);
            res.end(`
              <html>
                <head><title>Authentication Failed</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>Authentication Failed</h1>
                  <p>${error}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server?.close();
            reject({ success: false, error });
            return;
          }

          if (!code) {
            res.writeHead(200);
            res.end(`
              <html>
                <head><title>Authentication Failed</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>Authentication Failed</h1>
                  <p>No authorization code received.</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server?.close();
            reject({ success: false, error: "No authorization code" });
            return;
          }

          try {
            // Exchange code for token (using the actual redirect URI)
            const accessToken = await exchangeCodeForToken(code, `http://localhost:${port}/auth/callback`);
            
            // Get user info
            const user = await getUserInfo(accessToken);

            // Check if user is allowed (has dev or chairperson role)
            const allowed = await isUserAllowed(user.id);
            if (!allowed) {
              res.writeHead(200);
              res.end(`
                <html>
                  <head><title>Access Denied</title></head>
                  <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>Access Denied</h1>
                    <p>Your Discord account (${user.username}) is not authorized to use this application.</p>
                    <p>Only staff members with 'dev' or 'chairperson' roles can access this app.</p>
                    <p>You can close this window.</p>
                  </body>
                </html>
              `);
              server?.close();
              resolve({ success: false, error: "User does not have required role", user });
              return;
            }

            // Success!
            res.writeHead(200);
            res.end(`
              <html>
                <head><title>Authentication Successful</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>Authentication Successful!</h1>
                  <p>Welcome, ${user.username}!</p>
                  <p>You can close this window and return to the application.</p>
                </body>
              </html>
            `);
            server?.close();
            resolve({ success: true, user });
          } catch (err: any) {
            res.writeHead(200);
            res.end(`
              <html>
                <head><title>Authentication Error</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>Authentication Error</h1>
                  <p>${err?.message || "An error occurred"}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server?.close();
            reject({ success: false, error: err?.message || "Unknown error" });
          }
        } else {
          res.writeHead(404);
          res.end("Not Found");
        }
      });

      server.listen(port, "localhost", () => {
        console.log(`[auth] OAuth callback server listening on port ${port}`);
        
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(`http://localhost:${port}/auth/callback`)}&response_type=code&scope=identify`;
        
        
        // Open Discord OAuth in system browser
        shell.openExternal(authUrl);
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          port++;
          if (port < 3010) {
            // Try next port
            tryListen();
          } else {
            reject({ success: false, error: "Could not find available port" });
          }
        } else {
          reject({ success: false, error: err.message });
        }
      });
    };

    tryListen();
  });
}

