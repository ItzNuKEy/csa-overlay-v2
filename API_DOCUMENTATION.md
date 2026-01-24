# API Documentation

Complete reference guide for the CSA Media Database API endpoints.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Status Codes](#status-codes)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Error Responses](#error-responses)
- [Examples](#examples)

## Base URL

**Development:**
```
http://localhost:8000
```

**Production:**
```
https://api.yourdomain.com
```

## Authentication

The API uses two types of endpoints:

1. **Public Endpoints** - No authentication required
2. **Protected Endpoints** - Require API key authentication via `X-API-Key` header

### Using API Key

For protected endpoints, include your API key in the request header:

```
X-API-Key: your-api-key-here
```

The API key is configured in your `.env` file as `API_KEY`.

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Request successful, no response body |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Missing or invalid API key |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error - Server error |

## Public Endpoints

### Health Check

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

### Root Endpoint

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

**Example:**
```bash
curl http://localhost:8000/
```

---

### Check User Access

Check if a Discord ID has access to the application. Automatically logs the attempt with IP address and user agent.

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
- This endpoint automatically logs every access check attempt
- Logs include: Discord ID, IP address, success status, timestamp, and user agent
- Returns `has_access: true` if user exists and `is_active` is `true`
- Returns `has_access: false` if user doesn't exist or `is_active` is `false`
- Returns `can_manage_users: true` if the user has user management permissions, `false` otherwise

**Example:**
```bash
curl -X POST http://localhost:8000/auth/check \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678"}'
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/auth/check `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"discord_id": "123456789012345678"}' `
  -UseBasicParsing
```

---

## Protected Endpoints

All protected endpoints require the `X-API-Key` header.

### List All Users

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
    "created_at": "2026-01-23T05:00:00",
    "updated_at": "2026-01-23T05:00:00"
  },
  {
    "discord_id": "987654321098765432",
    "username": "admin#5678",
    "is_active": true,
    "can_manage_users": true,
    "created_at": "2026-01-22T10:30:00",
    "updated_at": "2026-01-22T10:30:00"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here"
```

**PowerShell:**
```powershell
$headers = @{
    "X-API-Key" = "your-api-key-here"
}
Invoke-WebRequest -Uri http://localhost:8000/users `
  -Headers $headers `
  -UseBasicParsing
```

---

### Get User by Discord ID

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
  "created_at": "2026-01-23T05:00:00",
  "updated_at": "2026-01-23T05:00:00"
}
```

**Error Response (404):**
```json
{
  "detail": "User with Discord ID 123456789012345678 not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here"
```

---

### Create User

Add a new user to the database.

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
  "username": "user#1234"
}
```

**Fields:**
- `discord_id` (string, required) - The Discord ID of the user
- `username` (string, optional) - The Discord username (e.g., "user#1234")

**Response (201 Created):**
```json
{
  "discord_id": "123456789012345678",
  "username": "user#1234",
  "is_active": true,
  "can_manage_users": false,
  "created_at": "2026-01-23T05:00:00",
  "updated_at": "2026-01-23T05:00:00"
}
```

**Error Response (400):**
```json
{
  "detail": "User with Discord ID 123456789012345678 already exists"
}
```

**Notes:**
- New users are created with `is_active: true` and `can_manage_users: false` by default
- Username is optional and can be set later
- Discord ID must be unique

**Example:**
```bash
curl -X POST http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_id": "123456789012345678",
    "username": "user#1234"
  }'
```

**PowerShell:**
```powershell
$headers = @{
    "X-API-Key" = "your-api-key-here"
    "Content-Type" = "application/json"
}
$body = @{
    discord_id = "123456789012345678"
    username = "user#1234"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/users `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing
```

---

### Update User

Update a user's information (toggle active status or update username).

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
  "is_active": false
}
```

Or:

```json
{
  "username": "newusername#5678"
}
```

Or all three:

```json
{
  "is_active": true,
  "username": "updateduser#9999",
  "can_manage_users": true
}
```

**Fields:**
- `is_active` (boolean, optional) - Set user's active status
- `username` (string, optional) - Update user's username
- `can_manage_users` (boolean, optional) - Grant or revoke user management permissions

**Response:**
```json
{
  "discord_id": "123456789012345678",
  "username": "newusername#5678",
  "is_active": false,
  "can_manage_users": false,
  "created_at": "2026-01-23T05:00:00",
  "updated_at": "2026-01-23T06:30:00"
}
```

**Error Response (404):**
```json
{
  "detail": "User with Discord ID 123456789012345678 not found"
}
```

**Notes:**
- You can update one, two, or all three fields
- Only include fields you want to update
- Setting `is_active: false` will prevent the user from accessing the application
- Setting `can_manage_users: true` grants the user permission to manage other users via the API

**Example:**
```bash
curl -X PATCH http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

---

### Delete User

Remove a user from the database.

**Endpoint:** `DELETE /users/{discord_id}`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
- Status: `204 No Content`
- Body: Empty

**Error Response (404):**
```json
{
  "detail": "User with Discord ID 123456789012345678 not found"
}
```

**Notes:**
- This action is permanent and cannot be undone
- All login attempts for this user will remain in the database

**Example:**
```bash
curl -X DELETE http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here"
```

---

### Get User Login Attempts

Get login attempts for a specific user.

**Endpoint:** `GET /users/{discord_id}/login-attempts`

**Authentication:** Required (API Key)

**Path Parameters:**
- `discord_id` (string, required) - The Discord ID of the user

**Query Parameters:**
- `limit` (integer, optional) - Maximum number of results to return
  - Default: `100`
  - Minimum: `1`
  - Maximum: `1000`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
[
  {
    "id": 1,
    "discord_id": "123456789012345678",
    "ip_address": "192.168.1.100",
    "success": true,
    "attempted_at": "2026-01-23T05:30:00",
    "user_agent": "Mozilla/5.0..."
  },
  {
    "id": 2,
    "discord_id": "123456789012345678",
    "ip_address": "192.168.1.100",
    "success": false,
    "attempted_at": "2026-01-23T05:25:00",
    "user_agent": "Mozilla/5.0..."
  }
]
```

**Notes:**
- Results are ordered by most recent first
- Includes both successful and failed attempts
- IP address is automatically captured from request headers

**Example:**
```bash
curl -X GET "http://localhost:8000/users/123456789012345678/login-attempts?limit=50" \
  -H "X-API-Key: your-api-key-here"
```

---

### Get All Login Attempts

Get all login attempts across all users with pagination.

**Endpoint:** `GET /users/login-attempts/all`

**Authentication:** Required (API Key)

**Query Parameters:**
- `page` (integer, optional) - Page number (1-indexed)
  - Default: `1`
  - Minimum: `1`
- `page_size` (integer, optional) - Number of items per page
  - Default: `50`
  - Minimum: `1`
  - Maximum: `1000`

**Headers:**
```
X-API-Key: your-api-key-here
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "discord_id": "123456789012345678",
      "ip_address": "192.168.1.100",
      "success": true,
      "attempted_at": "2026-01-23T05:30:00",
      "user_agent": "Mozilla/5.0..."
    },
    {
      "id": 2,
      "discord_id": "987654321098765432",
      "ip_address": "192.168.1.101",
      "success": false,
      "attempted_at": "2026-01-23T05:25:00",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 50
}
```

**Notes:**
- Results are ordered by most recent first
- Use pagination to handle large datasets efficiently
- `total` field shows the total number of login attempts across all pages

**Example:**
```bash
curl -X GET "http://localhost:8000/users/login-attempts/all?page=1&page_size=50" \
  -H "X-API-Key: your-api-key-here"
```

---

## Error Responses

### 400 Bad Request

Returned when request data is invalid or a user already exists.

```json
{
  "detail": "User with Discord ID 123456789012345678 already exists"
}
```

### 401 Unauthorized

Returned when API key is missing or invalid.

```json
{
  "detail": "Invalid or missing API key"
}
```

### 404 Not Found

Returned when a requested resource doesn't exist.

```json
{
  "detail": "User with Discord ID 123456789012345678 not found"
}
```

### 422 Unprocessable Entity

Returned when request validation fails (e.g., invalid data types, missing required fields).

```json
{
  "detail": [
    {
      "loc": ["body", "discord_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error

Returned when an unexpected server error occurs.

```json
{
  "detail": "Internal server error"
}
```

---

## Examples

### Complete Workflow Example

**1. Check if a user has access:**
```bash
curl -X POST http://localhost:8000/auth/check \
  -H "Content-Type: application/json" \
  -d '{"discord_id": "123456789012345678"}'
```

**2. Create a new user:**
```bash
curl -X POST http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "discord_id": "123456789012345678",
    "username": "newuser#1234"
  }'
```

**3. List all users:**
```bash
curl -X GET http://localhost:8000/users \
  -H "X-API-Key: your-api-key-here"
```

**4. Deactivate a user:**
```bash
curl -X PATCH http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

**5. Check login attempts for a user:**
```bash
curl -X GET "http://localhost:8000/users/123456789012345678/login-attempts?limit=10" \
  -H "X-API-Key: your-api-key-here"
```

**6. Delete a user:**
```bash
curl -X DELETE http://localhost:8000/users/123456789012345678 \
  -H "X-API-Key: your-api-key-here"
```

---

### PowerShell Examples

**Create a user:**
```powershell
$headers = @{
    "X-API-Key" = "your-api-key-here"
    "Content-Type" = "application/json"
}
$body = @{
    discord_id = "123456789012345678"
    username = "newuser#1234"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/users `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing
```

**List all users:**
```powershell
$headers = @{
    "X-API-Key" = "your-api-key-here"
}
$response = Invoke-WebRequest -Uri http://localhost:8000/users `
  -Headers $headers `
  -UseBasicParsing
$response.Content | ConvertFrom-Json
```

**Update a user:**
```powershell
$headers = @{
    "X-API-Key" = "your-api-key-here"
    "Content-Type" = "application/json"
}
$body = @{
    is_active = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/users/123456789012345678 `
  -Method PATCH `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing
```

---

### JavaScript/TypeScript Examples

**Check user access:**
```javascript
const response = await fetch('http://localhost:8000/auth/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    discord_id: '123456789012345678'
  })
});

const data = await response.json();
console.log(data.has_access); // true or false
console.log(data.can_manage_users); // true or false
```

**Create a user:**
```javascript
const response = await fetch('http://localhost:8000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    discord_id: '123456789012345678',
    username: 'newuser#1234'
  })
});

const user = await response.json();
console.log(user);
```

**List all users:**
```javascript
const response = await fetch('http://localhost:8000/users', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});

const users = await response.json();
console.log(users);
```

---

## Interactive API Documentation

The API includes interactive documentation powered by Swagger UI:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These interactive docs allow you to:
- Browse all available endpoints
- See request/response schemas
- Test endpoints directly from your browser
- View example requests and responses

---

## Rate Limiting

Currently, there are no rate limits implemented. However, it's recommended to:
- Implement reasonable request rates in your client applications
- Cache responses when appropriate
- Use pagination for large datasets

---

## Support

For issues or questions:
1. Check the main [README.md](README.md) for setup instructions
2. Review the interactive API docs at `/docs`
3. Check the troubleshooting section in the main README

---

**Last Updated:** January 2026  
**API Version:** 1.0.0
