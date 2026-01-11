# Discord OAuth Setup Guide

This guide will help you set up Discord OAuth authentication for your Electron app.

## Prerequisites

1. A Discord Application in the [Discord Developer Portal](https://discord.com/developers/applications)
2. The same OAuth credentials can be reused from your web app

## Step 1: Configure Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create a new one)
3. Go to the **OAuth2** section
4. Add a redirect URI: `http://localhost:3000/auth/callback` (or any port between 3000-3009)
   - Note: The app will automatically try ports 3000-3009 if one is in use
5. Copy your **Client ID** and **Client Secret**

## Step 2: Create `.env` File

### For Development & Building

Create a `.env` file in the project root directory with your Discord OAuth credentials:

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

**Important:** 
- Make sure `.env` is in your `.gitignore` file (it should be by default) to avoid committing your secrets to version control
- The `.env` file will be automatically packaged with the app during the build process
- Users don't need to manually create any configuration files - the app will work out of the box

### How It Works

The app checks for the `.env` file in the following order (first found is used):

1. **Resources directory** (packaged apps) - The `.env` file bundled with the app
2. **User data directory** (optional override) - Users can place a `.env` file here to override the bundled one
3. **Project root** (development) - For local development
4. **Current working directory** (fallback)

### For Packaged/Installed Apps

The `.env` file is automatically included in the packaged app, so users can simply:
1. Install the app
2. Open it and see the login screen
3. Sign in with Discord (if they have the required role)

**Optional: User Override**

If you need to override the bundled `.env` file, you can create one in the app's user data directory:

**Windows:**
- Location: `%APPDATA%\CSA Caster Production Kit\.env`

**macOS:**
- Location: `~/Library/Application Support/CSA Caster Production Kit/.env`

**Linux:**
- Location: `~/.config/CSA Caster Production Kit/.env`

**Quick way to find where the app is loading from:**
1. Open the app
2. Open DevTools (it should open automatically in packaged builds)
3. Check the console for `[auth] Loaded .env from: [path]` to see where it's loading the file

### Alternative: Environment Variables

If you prefer to use environment variables instead of a `.env` file, you can set them in your shell:

**Windows (PowerShell):**
```powershell
$env:DISCORD_CLIENT_ID="your_client_id_here"
$env:DISCORD_CLIENT_SECRET="your_client_secret_here"
```

**Windows (Command Prompt):**
```cmd
set DISCORD_CLIENT_ID=your_client_id_here
set DISCORD_CLIENT_SECRET=your_client_secret_here
```

**Linux/Mac:**
```bash
export DISCORD_CLIENT_ID="your_client_id_here"
export DISCORD_CLIENT_SECRET="your_client_secret_here"
```

The app will automatically load from `.env` file if it exists, or fall back to environment variables.

## Step 3: User Access Control

The app checks user access against your database API. Only users with **'dev'** or **'chairperson'** roles in the staff members database are allowed to access the app.

### How It Works

1. When a user authenticates with Discord, the app fetches their Discord ID
2. The app queries your API endpoints:
   - `https://api.playcsa.com/staffmembers?chairperson=true`
   - `https://api.playcsa.com/staffmembers?dev=true`
3. The app checks if the user's Discord ID matches a staff member
4. If the staff member has either 'dev' or 'chairperson' in their `roles` array, access is granted
5. Otherwise, access is denied

### Managing Access

To grant or revoke access, update the staff member's roles in your database:
- Add 'dev' or 'chairperson' role to grant access
- Remove both roles to revoke access

The app caches staff member data for 5 minutes to reduce API calls. The cache is automatically refreshed when it expires.

## Step 4: Testing

1. Start your Electron app
2. You should see the login screen
3. Click "Sign in with Discord"
4. A browser window will open for Discord authentication
5. After authorizing, you'll be redirected back
6. If your Discord ID is in the allowlist, you'll be logged in
7. If not, you'll see an "Access Denied" message

## How It Works

1. User clicks "Sign in with Discord" button
2. App opens Discord OAuth URL in the system browser
3. User authorizes the application in Discord
4. Discord redirects to `http://localhost:3000/auth/callback` (or similar port)
5. A local HTTP server catches the callback and extracts the authorization code
6. The app exchanges the code for an access token
7. The app fetches user information from Discord API
8. The app checks if the user's Discord ID is in the allowlist
9. If allowed, the user is logged in and can use the app
10. If not allowed, access is denied

## Troubleshooting

### "Discord OAuth not configured" error
- **For development:** Make sure you've created a `.env` file in the project root with your credentials
- **For building:** Ensure the `.env` file exists in the project root before running `npm run build` (it will be packaged with the app)
- **For packaged apps:** The `.env` should be automatically included. If you see this error:
  - Check the console logs for `[auth] Loaded .env from: [path]` to see where it's looking
  - Verify the `.env` file was included in the build (check the resources directory)
  - As a workaround, you can create a `.env` file in the app's user data directory (see Step 2 above)
- **Alternative:** Set `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` as system environment variables
- Restart the app after making any changes

### "Access Denied" after authentication
- Your Discord ID is not found in the staff members database, or
- You don't have 'dev' or 'chairperson' role assigned
- Contact an administrator to add you to the staff members with the appropriate role

### Port already in use
- The app automatically tries ports 3000-3009
- Make sure at least one port in this range is available
- You can modify the port range in `electron/discordAuth.ts` if needed

### Redirect URI mismatch
- Make sure the redirect URI in Discord Developer Portal matches: `http://localhost:3000/auth/callback`
- If the app uses a different port (3001, 3002, etc.), you may need to add multiple redirect URIs in Discord

## Security Notes

- User access is validated against your remote API (`api.playcsa.com`)
- Staff member data is cached for 5 minutes to reduce API calls
- The cache can be manually cleared using `window.auth.clearCache()` if needed
- For production, consider:
  - Implementing token refresh for long sessions
  - Adding session expiration
  - Rate limiting on your API endpoints

## Reusing Web App OAuth

Yes, you can reuse the same Discord OAuth application! Just:
1. Add the localhost redirect URI to your existing Discord app's OAuth2 redirects
2. Use the same Client ID and Client Secret
3. The scopes should include at least `identify` (which is what this implementation uses)

