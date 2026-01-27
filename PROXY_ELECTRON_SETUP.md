---
name: Secure Credentials with Proxy
overview: Remove API key from Electron app package and update app to use server proxy endpoints with Discord OAuth session authentication instead of direct API calls with embedded keys.
todos:
  - id: "1"
    content: Remove .env from electron-builder.json5 extraResources to prevent bundling secrets
    status: pending
  - id: "2"
    content: Remove VITE_API_KEY from frontend config.ts (no longer needed)
    status: pending
  - id: "3"
    content: Update userManagementApi.ts to use Discord OAuth session cookies instead of API key
    status: pending
  - id: "4"
    content: Change API endpoints in userManagementApi.ts to use /proxy/* paths
    status: pending
  - id: "5"
    content: Add session cookie handling in Electron for OAuth authentication
    status: pending
  - id: "6"
    content: Update error messages to reflect OAuth-based authentication
    status: pending
isProject: false
---

# Secure Credentials with Server Proxy - Electron App Changes

## Overview

This plan covers the Electron app changes needed to use secure proxy endpoints. The server-side implementation is documented separately in `SERVER_PROXY_IMPLEMENTATION_GUIDE.md`.

## Current Security Issues

1. **`.env` file bundled in package** - `electron-builder.json5` bundles `.env` into `extraResources`, making it accessible in packaged apps
2. **VITE_API_KEY exposed in frontend** - Vite bundles all `VITE_*` variables into the frontend JavaScript bundle, making them visible
3. **Secrets readable from resources folder** - Packaged apps can extract `.env` from the resources directory

## Solution Architecture

```
Electron App (No Secrets)
  ├─ Has Discord OAuth session cookie
  ├─ Makes request to /proxy/users
  └─ Sends: Cookie: session_id=abc123
            ↓
FastAPI Server Proxy Endpoints (/proxy/*)
  ├─ Validates Discord OAuth session
  ├─ Checks can_manage_users = true
  ├─ Uses SERVER's API_KEY (never exposed)
  └─ Proxies to /users, /access-requests endpoints
```

## Implementation Steps

### Step 1: Remove .env from Package

**File**: `electron-builder.json5`

Remove the `.env` file from `extraResources` to prevent bundling secrets:

```json5
extraResources: [
  // ... other resources ...
  // REMOVE THIS LINE:
  // { "from": ".env", "to": ".env" },
  // ...
]
```

### Step 2: Remove VITE_API_KEY from Frontend Config

**File**: `src/components/UserManagement/config.ts`

Remove `VITE_API_KEY` usage - only keep `VITE_API_URL`:

```typescript
export function getApiConfig(): { apiUrl: string } {
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    console.error("[UserManagement] Invalid VITE_API_URL");
    apiUrl = "http://localhost:8000";
  }

  return {
    apiUrl,  // Only return apiUrl, no apiKey
  };
}
```

### Step 3: Update Electron API Client to Use Proxy Endpoints

**File**: `electron/userManagementApi.ts`

**Changes needed**:

1. Remove API key logic (lines 59, 76, 112)
2. Change endpoints to use `/proxy/*` prefix
3. Use session cookies instead of API key header
4. Remove `.env` loading logic (or keep for Discord OAuth only)
```typescript
// Remove API key from getApiConfig
function getApiConfig() {
  let API_URL = process.env.CSA_MEDIA_API_URL || process.env.VITE_API_URL;
  // REMOVE: const API_KEY = process.env.CSA_MEDIA_API_KEY || process.env.VITE_API_KEY || "";

  if (!API_URL) {
    // ... validation logic ...
  }

  return {
    apiUrl: API_URL.replace(/\/$/, ""),
    // REMOVE: apiKey: API_KEY,
  };
}

// Update apiRequest to use proxy endpoints and session cookies
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
  } = {}
): Promise<T> {
  const config = getApiConfig();
  // CHANGE: Add /proxy prefix
  const url = `${config.apiUrl}/proxy${endpoint}`;

  const headers: HeadersInit = {
    // REMOVE: "X-API-Key": config.apiKey,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
    // ADD: Include session cookies
    credentials: "include",
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  // ... rest of error handling ...
}
```


### Step 4: Update Frontend API Service

**File**: `src/components/UserManagement/services/api.ts`

The frontend service already uses `window.userManagementApi` (IPC), so it should automatically work with the updated Electron API client. No changes needed unless you want to update error messages.

### Step 5: Ensure Discord OAuth Sets Session Cookies

**File**: `electron/discordAuth.ts`

Verify that the Discord OAuth flow creates session cookies that will be sent with proxy requests. The OAuth callback should set cookies that are accessible to the proxy endpoints.

**Note**: If your OAuth flow happens in Electron and doesn't set server-side session cookies, you may need to:

- Redirect to server's OAuth endpoint (`https://media.playcsa.com/auth/discord/login`)
- Or implement a way to exchange OAuth tokens for session cookies

### Step 6: Update Error Messages

**File**: `src/components/UserManagement/components/ErrorDisplay.tsx`

Update error messages to reflect OAuth-based authentication instead of API key issues:

```typescript
// Update error messages to mention:
// - "Authentication required" instead of "API key missing"
// - "Please log in via Discord" instead of "Check API key"
// - "Permission denied" for 403 errors
```

## File Changes Summary

### Files to Modify

1. **`electron-builder.json5`**

   - Remove `.env` from `extraResources`

2. **`src/components/UserManagement/config.ts`**

   - Remove `VITE_API_KEY` usage
   - Only return `apiUrl` (no `apiKey`)

3. **`electron/userManagementApi.ts`**

   - Remove API key from `getApiConfig()`
   - Change endpoints to `/proxy/*`
   - Remove `X-API-Key` header
   - Add `credentials: "include"` to fetch options

4. **`src/components/UserManagement/components/ErrorDisplay.tsx`** (optional)

   - Update error messages for OAuth-based auth

### Files to Verify

1. **`electron/discordAuth.ts`**

   - Ensure OAuth flow creates session cookies
   - Verify cookies are accessible to proxy endpoints

2. **`src/components/UserManagement/services/api.ts`**

   - Already uses IPC, should work automatically

## Environment Variables

### Development (.env)

Keep these for Discord OAuth (needed for OAuth flow):

- `DISCORD_CLIENT_ID` - Public, safe to expose
- `DISCORD_CLIENT_SECRET` - Needed for OAuth token exchange

Remove or keep for development only:

- `VITE_API_KEY` - No longer needed (remove from frontend)
- `CSA_MEDIA_API_KEY` - No longer needed in Electron app

Keep:

- `VITE_API_URL` - Still needed for API URL
- `CSA_MEDIA_API_URL` - Still needed for API URL

### Production (Packaged App)

- `.env` file will NOT be bundled (removed from `extraResources`)
- Only Discord OAuth credentials remain (acceptable for OAuth flow)
- API key is never in the app

## Testing Checklist

- [ ] Remove `.env` from `electron-builder.json5` extraResources
- [ ] Remove `VITE_API_KEY` from `config.ts`
- [ ] Update `userManagementApi.ts` to use `/proxy/*` endpoints
- [ ] Remove API key header from requests
- [ ] Add `credentials: "include"` to fetch options
- [ ] Test user management functions (list, create, update, delete)
- [ ] Test access requests functions (list, approve, deny)
- [ ] Verify session cookies are sent with requests
- [ ] Test error handling (401, 403 errors)
- [ ] Update error messages (optional)

## Security Benefits

1. **API key never leaves server** - Only server knows the API key
2. **No secrets in packaged app** - App only contains Discord OAuth credentials (which are needed for OAuth flow)
3. **User-based permissions** - Only users with `can_manage_users = true` can access proxy
4. **Audit trail** - All requests go through server, can be logged
5. **Revocable access** - Can revoke access by removing user permission in database

## Dependencies

This plan depends on the server-side proxy endpoints being implemented first. See `SERVER_PROXY_IMPLEMENTATION_GUIDE.md` for server implementation details.

## Notes

- Discord OAuth credentials (`DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`) remain in the app because they're needed for the OAuth flow. This is acceptable as:
  - The client secret is needed to exchange OAuth codes for tokens
  - Users can't use these credentials to directly access your API
  - The actual API key (which grants direct API access) is never in the app

- If you want to further secure Discord credentials, you can move the OAuth flow to the server (redirect to `https://media.playcsa.com/auth/discord/login`), but this requires additional implementation.