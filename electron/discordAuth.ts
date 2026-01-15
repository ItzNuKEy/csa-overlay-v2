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

// API response interfaces
interface StaffMember {
  id: number;
  Member: {
    csa_id: number;
    discord_id: string;
    csa_name: string;
    display_id: string;
  };
  in_staff_guild: boolean;
  roles: string[];
}

// Cache for staff members to avoid hitting API on every check
let staffMembersCache: StaffMember[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch staff members from API
const CSA_API_KEY = process.env.CSA_API_KEY || "";

async function fetchStaffMembers(): Promise<StaffMember[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (CSA_API_KEY) {
    headers["X-API-Key"] = CSA_API_KEY;
  }
  try {
    const [chairpersonResponse, devResponse] = await Promise.all([
      fetch("https://api.playcsa.com/staffmembers?chairperson=true", { headers }),
      fetch("https://api.playcsa.com/staffmembers?dev=true", { headers }),
    ]);

    if (!chairpersonResponse.ok || !devResponse.ok) {
      const chairText = await chairpersonResponse.text().catch(() => "");
      const devText = await devResponse.text().catch(() => "");

      console.error("[auth] chairperson status:", chairpersonResponse.status, chairpersonResponse.statusText);
      console.error("[auth] chairperson body:", chairText);

      console.error("[auth] dev status:", devResponse.status, devResponse.statusText);
      console.error("[auth] dev body:", devText);

      throw new Error("Failed to fetch staff members from API");
    }

    const [chairpersonData, devData] = await Promise.all([
      chairpersonResponse.json(),
      devResponse.json(),
    ]);

    const allStaff: StaffMember[] = [...chairpersonData, ...devData];
    const uniqueStaff = Array.from(new Map(allStaff.map(m => [m.id, m])).values());
    return uniqueStaff;
  } catch (err) {
    console.error("[auth] Failed to fetch staff members:", err);
    throw err;
  }
}


// Get staff members (with caching)
async function getStaffMembers(): Promise<StaffMember[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (staffMembersCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return staffMembersCache;
  }

  // Fetch fresh data
  staffMembersCache = await fetchStaffMembers();
  cacheTimestamp = now;
  return staffMembersCache;
}

// Check if a Discord user ID has dev or chairperson role
export async function isUserAllowed(discordId: string): Promise<boolean> {
  try {
    const staffMembers = await getStaffMembers();
    
    // Find staff member with matching Discord ID
    const staffMember = staffMembers.find(
      (member) => member.Member.discord_id === discordId
    );

    if (!staffMember) {
      return false;
    }

    // Check if user has 'dev' or 'chairperson' role
    return (
      staffMember.roles.includes("dev") ||
      staffMember.roles.includes("chairperson")
    );
  } catch (err) {
    console.error("[auth] Error checking user access:", err);
    // On API error, deny access for security
    return false;
  }
}

// Clear cache (useful for testing or forcing refresh)
export function clearStaffMembersCache(): void {
  staffMembersCache = null;
  cacheTimestamp = 0;
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

