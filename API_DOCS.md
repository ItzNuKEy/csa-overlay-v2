# CSA Media Database API - Endpoints Documentation

Complete reference for all API endpoints in the CSA Media Database API.

## Base URL
```
https://media.playcsa.com

```

## Authentication

The API uses two authentication methods depending on the endpoint:

### API Key Authentication

Most protected endpoints require an API key in the request header:

```
X-API-Key: your-api-key-here
```

The API key is configured in the server's `.env` file as `API_KEY`.

### Discord OAuth Session Authentication

Some endpoints (OAuth endpoints and API logs) use Discord OAuth2 authentication with session cookies. This requires:

1. Initiating OAuth flow via `/auth/discord/login`
2. Completing authentication via Discord callback
3. Session cookie is automatically set and used for subsequent requests
4. For API logs endpoints, the user must also have `can_manage_users = true` in the database

Session cookies are automatically managed by the browser after successful OAuth authentication.

## Endpoints

### Public Endpoints

These endpoints do not require authentication.

---

#### Health Check

Check if the API server is running and healthy.

**Endpoint:** `GET /health`

**Authentication:** None required

**Response:**
```json
{
  "status": "healthy"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

---

#### Root Endpoint

Get API information and version.

**Endpoint:** `GET /`

**Authentication:** None required

**Response:**
```json
{
  "message": "CSA Media Database API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

#### Check User Access

Check if a Discord ID has access to the application.

**Endpoint:** `POST /auth/check`

**Authentication:** None required

**Request Body:**
```json
{
  "discord_id": "123456789012345678"
}
```

**Response:**
```json
{
  "has_access": true,
  "can_manage_users": false
}
```

**Notes:**
- Returns `has_access: true` if user exists and `is_active` is `true`
- Returns `has_access: false` if user doesn't exist or `is_active` is `false`
- Returns `can_manage_users: true` if the user has management permissions

**Example:**
```bash
curl -X POST http://localhost:8000/auth/check \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678"}'
```

---

#### Create Access Request

Create a new access request for a Discord user.

**Endpoint:** `POST /access-requests`

**Authentication:** None required

**Request Body:**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "requested_at": "2026-01-26T10:30:00Z",
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null,
  "notes": null
}
```

**Error Responses:**
- `400 Bad Request`: User already exists or has pending request

**Example:**
```bash
curl -X POST http://localhost:8000/access-requests \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678", "username": "user#1234"}'
```

---

#### Check Pending Request

Check if a Discord ID has a pending access request.

**Endpoint:** `GET /access-requests/{discord_id}`

**Authentication:** None required

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID to check

**Response:** `200 OK`
```json
{
  "id": 1,
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "requested_at": "2026-01-26T10:30:00Z",
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null,
  "notes": null
}
```

**Error Responses:**
- `404 Not Found`: No pending access request found

**Example:**
```bash
curl http://localhost:8000/access-requests/123456789012345678
```

---

#### Log Login Attempt

Log a login attempt with Discord ID, IP address, and other relevant information.

**Endpoint:** `POST /login-attempts`

**Authentication:** None required

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "discord_id": "123456789012345678",
  "success": true,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Notes:**
- `ip_address` and `user_agent` are optional - if not provided, they will be automatically extracted from the request headers
- `success` indicates whether the login attempt was successful

**Response:** `201 Created`
```json
{
  "id": 1,
  "discord_id": "123456789012345678",
  "ip_address": "192.168.1.1",
  "success": true,
  "attempted_at": "2026-01-26T10:30:00Z",
  "user_agent": "Mozilla/5.0..."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/login-attempts \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678", "success": true}'
```

---

### OAuth Endpoints

These endpoints handle Discord OAuth2 authentication and session management.

---

#### Discord OAuth Login

Redirects to Discord OAuth2 authorization page.

**Endpoint:** `GET /auth/discord/login`

**Authentication:** None required (initiates OAuth flow)

**Response:** `302 Redirect` to Discord OAuth page

**Notes:**
- User will be redirected to Discord to authorize the application
- After authorization, Discord redirects back to `/auth/discord/callback`
- Requires `DISCORD_CLIENT_ID` and `DISCORD_REDIRECT_URI` to be configured in `.env`

**Example:**
```bash
# In browser, navigate to:
https://media.playcsa.com/auth/discord/login
```

---

#### Discord OAuth Callback

Handles the OAuth callback from Discord and creates a session.

**Endpoint:** `GET /auth/discord/callback`

**Authentication:** None required (handled by Discord OAuth)

**Query Parameters:**
- `code` (string, required) - Authorization code from Discord

**Response:** `302 Redirect` to `/auth/callback` (frontend route)

**Notes:**
- This endpoint is called automatically by Discord after user authorization
- Creates a session cookie that is used for authenticated requests
- User must exist in database and have `is_active = true`
- Session cookie is set automatically and expires after 7 days

**Error Responses:**
- `400 Bad Request`: Missing authorization code or Discord API error
- `403 Forbidden`: User not found or not active in database

---

#### Get Current User

Get information about the currently authenticated user.

**Endpoint:** `GET /auth/discord/me`

**Authentication:** Required (Discord OAuth session cookie)

**Response:**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "discord_username": "username",
  "authenticated": true
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated (no valid session)

**Example:**
```bash
curl -X GET http://localhost:8000/auth/discord/me \
  --cookie "session_id=your-session-id"
```

---

#### Logout

Log out the current user and destroy the session.

**Endpoint:** `GET /auth/discord/logout`

**Authentication:** Required (Discord OAuth session cookie)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Notes:**
- Destroys the session cookie
- User will need to authenticate again to access protected endpoints

**Example:**
```bash
curl -X GET http://localhost:8000/auth/discord/logout \
  --cookie "session_id=your-session-id"
```

---

### Protected Endpoints (API Key)

These endpoints require the `X-API-Key` header for authentication.

---

#### List All Users

Get a list of all users in the database, ordered by creation date (newest first).

**Endpoint:** `GET /users`

**Authentication:** Required (API Key)

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
[
  {
    "discord_id": "123456789012345678",
    "username": "user#1234",
    "is_active": true,
    "can_manage_users": false,
    "created_at": "2026-01-23T05:00:00Z",
    "updated_at": "2026-01-23T05:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here"
```

---

#### Create User

Create a new user in the database.

**Endpoint:** `POST /users`

**Authentication:** Required (API Key)

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "is_active": true,
  "can_manage_users": false
}
```

**Response:** `201 Created`
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "is_active": true,
  "can_manage_users": false,
  "created_at": "2026-01-26T10:30:00Z",
  "updated_at": "2026-01-26T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: User with Discord ID already exists

**Example:**
```bash
curl -X POST http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678", "username": "user#1234"}'
```

---

#### Get User by Discord ID

Get details for a specific user by their Discord ID.

**Endpoint:** `GET /users/{discord_id}`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "is_active": true,
  "can_manage_users": false,
  "created_at": "2026-01-23T05:00:00Z",
  "updated_at": "2026-01-23T05:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: User with Discord ID not found

**Example:**
```bash
curl -X GET http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here"
```

---

#### Update User

Update a user's properties (is_active, can_manage_users, username).

**Endpoint:** `PATCH /users/{discord_id}`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_active": false,
  "can_manage_users": true,
  "username": "updated_username"
}
```

All fields are optional - only include the fields you want to update.

**Response:**
```json
{
  "discord_id": "123456789012345678",
  "username": "updated_username",
  "is_active": false,
  "can_manage_users": true,
  "created_at": "2026-01-23T05:00:00Z",
  "updated_at": "2026-01-26T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: User with Discord ID not found

**Example:**
```bash
curl -X PATCH http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

#### Delete User

Remove a user from the database.

**Endpoint:** `DELETE /users/{discord_id}`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: User with Discord ID not found

**Example:**
```bash
curl -X DELETE http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here"
```

---

#### List Access Requests

List all access requests with optional filtering and pagination.

**Endpoint:** `GET /access-requests`

**Authentication:** Required (API Key)

**Headers:**
```
X-API-Key: your-api-key-here
```

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `approved`, or `denied`
- `page` (integer, optional) - Page number (default: 1, minimum: 1)
- `page_size` (integer, optional) - Items per page (default: 50, minimum: 1, maximum: 1000)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "discord_id": "123456789012345678",
      "username": "user#1234",
      "requested_at": "2026-01-26T10:30:00Z",
      "status": "pending",
      "reviewed_by": null,
      "reviewed_at": null,
      "notes": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/access-requests?status=pending&page=1&page_size=50" \
  -H "X-API-Key: your-api-key-here"
```

---

#### Approve Access Request

Approve an access request and create a user account.

**Endpoint:** `POST /access-requests/{discord_id}/approve`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the request to approve

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Approved for access"
}
```

**Response:**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "is_active": true,
  "can_manage_users": false,
  "created_at": "2026-01-26T10:30:00Z",
  "updated_at": "2026-01-26T10:30:00Z"
}
```

**Notes:**
- Creates a new user with `is_active: true` and `can_manage_users: false`
- Updates the access request status to `approved`
- Sets `reviewed_at` timestamp

**Error Responses:**
- `404 Not Found`: Access request not found
- `400 Bad Request`: Request already processed or user already exists

**Example:**
```bash
curl -X POST http://localhost:8000/access-requests/123456789012345678/approve \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'
```

---

#### Deny Access Request

Deny an access request (marks as denied, keeps for audit).

**Endpoint:** `POST /access-requests/{discord_id}/deny`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the request to deny

**Headers:**
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Denied - reason here"
}
```

**Response:**
```json
{
  "id": 1,
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "requested_at": "2026-01-26T10:30:00Z",
  "status": "denied",
  "reviewed_by": null,
  "reviewed_at": "2026-01-26T11:00:00Z",
  "notes": "Denied - reason here"
}
```

**Notes:**
- Does NOT create a user account
- Updates the access request status to `denied`
- Sets `reviewed_at` timestamp

**Error Responses:**
- `404 Not Found`: Access request not found
- `400 Bad Request`: Request already processed

**Example:**
```bash
curl -X POST http://localhost:8000/access-requests/123456789012345678/deny \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Denied"}'
```

---

#### List Login Attempts

List all login attempts with optional filtering and pagination.

**Endpoint:** `GET /login-attempts`

**Authentication:** Required (API Key)

**Headers:**
```
X-API-Key: your-api-key-here
```

**Query Parameters:**
- `discord_id` (string, optional) - Filter by Discord ID
- `success` (boolean, optional) - Filter by success status (true/false)
- `page` (integer, optional) - Page number (default: 1, minimum: 1)
- `page_size` (integer, optional) - Items per page (default: 50, minimum: 1, maximum: 1000)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "discord_id": "123456789012345678",
      "ip_address": "192.168.1.1",
      "success": true,
      "attempted_at": "2026-01-26T10:30:00Z",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/login-attempts?discord_id=123456789012345678&success=true&page=1" \
  -H "X-API-Key: your-api-key-here"
```

---

#### Get User Login Attempts

Get login attempts for a specific Discord user.

**Endpoint:** `GET /login-attempts/{discord_id}`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Headers:**
```
X-API-Key: your-api-key-here
```

**Query Parameters:**
- `limit` (integer, optional) - Maximum number of attempts to return (default: 100, minimum: 1, maximum: 1000)

**Response:**
```json
[
  {
    "id": 1,
    "discord_id": "123456789012345678",
    "ip_address": "192.168.1.1",
    "success": true,
    "attempted_at": "2026-01-26T10:30:00Z",
    "user_agent": "Mozilla/5.0..."
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/login-attempts/123456789012345678?limit=50" \
  -H "X-API-Key: your-api-key-here"
```

---

### API Logs Endpoints

These endpoints provide access to API request logs. They require Discord OAuth authentication AND admin permissions (`can_manage_users = true`).

---

#### List API Logs

List all API request logs with optional filtering and pagination.

**Endpoint:** `GET /api-logs`

**Authentication:** Required (Discord OAuth session + admin permissions)

**Query Parameters:**
- `method` (string, optional) - Filter by HTTP method (GET, POST, PATCH, DELETE, etc.)
- `status_code` (integer, optional) - Filter by HTTP status code
- `path` (string, optional) - Search in request path (case-insensitive partial match)
- `discord_id` (string, optional) - Filter by Discord ID (if logged in request)
- `date_from` (datetime, optional) - Filter from date (ISO format: `2026-01-26T00:00:00Z`)
- `date_to` (datetime, optional) - Filter to date (ISO format: `2026-01-26T23:59:59Z`)
- `page` (integer, optional) - Page number (default: 1, minimum: 1)
- `page_size` (integer, optional) - Items per page (default: 50, minimum: 1, maximum: 1000)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "method": "GET",
      "path": "/users",
      "status_code": 200,
      "response_time_ms": 45.2,
      "discord_id": "123456789012345678",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-01-26T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 50
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated (no valid Discord OAuth session)
- `403 Forbidden`: User does not have admin permissions (`can_manage_users = false`)

**Example:**
```bash
curl -X GET "http://localhost:8000/api-logs?method=GET&status_code=200&page=1&page_size=50" \
  --cookie "session_id=your-session-id"
```

---

#### Get API Log Statistics

Get aggregated statistics about API logs.

**Endpoint:** `GET /api-logs/stats`

**Authentication:** Required (Discord OAuth session + admin permissions)

**Query Parameters:**
- `date_from` (datetime, optional) - Filter from date (ISO format: `2026-01-26T00:00:00Z`)
- `date_to` (datetime, optional) - Filter to date (ISO format: `2026-01-26T23:59:59Z`)

**Response:**
```json
{
  "total_logs": 1500,
  "avg_response_time_ms": 42.5,
  "error_rate": 2.3
}
```

**Notes:**
- `total_logs`: Total number of API requests in the filtered period
- `avg_response_time_ms`: Average response time in milliseconds
- `error_rate`: Percentage of requests with status code >= 400

**Error Responses:**
- `401 Unauthorized`: Not authenticated (no valid Discord OAuth session)
- `403 Forbidden`: User does not have admin permissions (`can_manage_users = false`)

**Example:**
```bash
curl -X GET "http://localhost:8000/api-logs/stats?date_from=2026-01-26T00:00:00Z&date_to=2026-01-26T23:59:59Z" \
  --cookie "session_id=your-session-id"
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Request successful, no response body |
| 302  | Found - Redirect (used for OAuth flows) |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Missing or invalid API key/OAuth session |
| 403  | Forbidden - Authenticated but lacks required permissions |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error - Server error |

## Interactive Documentation

The API includes interactive documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These allow you to:
- Browse all available endpoints
- See request/response schemas
- Test endpoints directly from your browser
- View example requests and responses

---

**Last Updated:** January 26, 2026  
**API Version:** 1.0.0
