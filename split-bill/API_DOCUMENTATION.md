# 📚 SplitBill API Documentation

## Overview

Interactive API documentation is available via Swagger UI. This page provides a quick reference guide and examples.

---

## 🌐 Access API Documentation

### Local Development
- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api/swagger

### Production
- **Swagger UI:** https://splitbill.vercel.app/api-docs
- **OpenAPI JSON:** https://splitbill.vercel.app/api/swagger

---

## 📋 Base URL

```
http://localhost:3000
```

---

## 🔐 Authentication

Most endpoints require authentication via NextAuth.js session cookie.

### Login Flow

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "bio": "Optional bio"
  }'

# 2. Session cookie is automatically set
# Use it in subsequent requests

# 3. Make authenticated requests
curl http://localhost:3000/api/groups \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## 🛡️ CSRF Protection

State-changing operations (POST, PUT, DELETE, PATCH) require CSRF token.

### Getting CSRF Token

```bash
curl http://localhost:3000/api/csrf
```

Response:
```json
{
  "csrfToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### Using CSRF Token

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token-here" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "My Group",
    "description": "Group description"
  }'
```

---

## 📍 API Endpoints

### Authentication Endpoints

#### Register
```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "bio": "Optional bio (max 500 chars)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "clh1234567890abcdef",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Error Responses:**
- `400` - Validation error (weak password, invalid email)
- `409` - Email already registered
- `429` - Rate limited (5 attempts per 15 minutes)

---

### Group Endpoints

#### Get All Groups
```
GET /api/groups
```

**Headers:**
- `Cookie: next-auth.session-token=...`

**Response (200):**
```json
{
  "groups": [
    {
      "id": "clh1234567890abcdef",
      "name": "Apartment Expenses",
      "description": "Shared costs for our apartment",
      "ownerId": "clh1234567890abcdef",
      "isArchived": false,
      "createdAt": "2024-01-20T12:00:00Z",
      "owner": {
        "id": "clh1234567890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [
        {
          "id": "clh9876543210fedcba",
          "userId": "clh1234567890abcdef",
          "isPending": false,
          "joinedAt": "2024-01-20T12:00:00Z",
          "user": {
            "id": "clh1234567890abcdef",
            "name": "John Doe"
          }
        }
      ],
      "_count": {
        "members": 2,
        "expenses": 5
      }
    }
  ],
  "total": 1
}
```

#### Create Group (EDITOR/ADMIN only)
```
POST /api/groups
```

**Headers:**
- `Cookie: next-auth.session-token=...`
- `X-CSRF-Token: ...`
- `Content-Type: application/json`

**Request:**
```json
{
  "name": "Weekend Trip",
  "description": "Expenses for our weekend getaway"
}
```

**Response (201):**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": "clh1234567890abcdef",
    "name": "Weekend Trip",
    "description": "Expenses for our weekend getaway",
    "ownerId": "clh1234567890abcdef",
    "isArchived": false,
    "createdAt": "2024-01-20T12:00:00Z"
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Insufficient permissions (requires EDITOR/ADMIN role)

---

### Expense Endpoints

#### Get Expenses for Group
```
GET /api/expenses?groupId=GROUP_ID
```

**Headers:**
- `Cookie: next-auth.session-token=...`

**Query Parameters:**
- `groupId` (required) - Group ID to filter expenses

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "clh1234567890abcdef",
      "groupId": "clh1234567890abcdef",
      "payerId": "clh1234567890abcdef",
      "description": "Dinner at restaurant",
      "amount": 150.00,
      "category": "FOOD",
      "date": "2024-01-20T18:00:00Z",
      "createdAt": "2024-01-20T12:00:00Z",
      "payer": {
        "id": "clh1234567890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "splits": [
        {
          "id": "clh9876543210fedcba",
          "expenseId": "clh1234567890abcdef",
          "userId": "clh1234567890abcdef",
          "amount": 75.00,
          "user": {
            "id": "clh1234567890abcdef",
            "name": "John Doe"
          }
        },
        {
          "id": "clhabcdef1234567890",
          "expenseId": "clh1234567890abcdef",
          "userId": "clh9876543210fedcba",
          "amount": 75.00,
          "user": {
            "id": "clh9876543210fedcba",
            "name": "Jane Smith"
          }
        }
      ]
    }
  ],
  "total": 1
}
```

#### Create Expense
```
POST /api/expenses
```

**Headers:**
- `Cookie: next-auth.session-token=...`
- `X-CSRF-Token: ...`
- `Content-Type: application/json`

**Request:**
```json
{
  "groupId": "clh1234567890abcdef",
  "description": "Dinner at Italian restaurant",
  "amount": 120.00,
  "category": "FOOD",
  "date": "2024-01-20T18:00:00Z",
  "splits": [
    {
      "userId": "clh1234567890abcdef",
      "amount": 60.00
    },
    {
      "userId": "clh9876543210fedcba",
      "amount": 60.00
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id": "clh1234567890abcdef",
    "groupId": "clh1234567890abcdef",
    "payerId": "clh1234567890abcdef",
    "description": "Dinner at Italian restaurant",
    "amount": 120.00,
    "category": "FOOD",
    "date": "2024-01-20T18:00:00Z",
    "createdAt": "2024-01-20T12:00:00Z",
    "splits": [...]
  }
}
```

**Errors:**
- `400` - Validation error or split amounts don't match total
- `401` - Not authenticated
- `403` - Not a group member

---

### Utility Endpoints

#### Health Check
```
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected"
}
```

#### Get CSRF Token
```
GET /api/csrf
```

**Response (200):**
```json
{
  "csrfToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

---

## 📊 Data Models

### User
```typescript
{
  id: string;           // CUID format
  email: string;        // Email address
  name: string;         // User name
  role: "USER" | "EDITOR" | "ADMIN";
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;         // Max 500 characters
  createdAt: Date;
  updatedAt: Date;
}
```

### Group
```typescript
{
  id: string;
  name: string;         // Min 2, Max 100 characters
  description?: string; // Max 500 characters
  ownerId: string;      // User ID of group owner
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  members?: GroupMember[];
  _count?: {
    members: number;
    expenses: number;
  };
}
```

### Expense
```typescript
{
  id: string;
  groupId: string;
  payerId: string;      // Who paid for the expense
  description: string;  // Min 2, Max 200 characters
  amount: number;       // Decimal format
  category: "FOOD" | "TRANSPORT" | "ACCOMMODATION" | "ENTERTAINMENT" | "BILLS" | "OTHER";
  date: Date;           // When the expense occurred
  createdAt: Date;
  updatedAt: Date;
  payer?: User;
  splits?: ExpenseSplit[];
}
```

### ExpenseSplit
```typescript
{
  id: string;
  expenseId: string;
  userId: string;       // Who owes money
  amount: number;       // How much they owe
  user?: User;
}
```

---

## 🔄 Rate Limits

Different endpoints have different rate limits per IP:

- **Auth endpoints** (`/api/auth/*`): **5 requests / 15 minutes**
- **Standard API**: **100 requests / 15 minutes**
- **Public endpoints**: **300 requests / 15 minutes**

When rate limited, you'll receive:
```
HTTP 429 Too Many Requests

{
  "error": "Too many requests, please try again later.",
  "retryAfter": 900,
  "resetTime": "2024-01-20T12:15:00Z"
}
```

---

## 🛠️ Common Use Cases

### Creating an Expense Split Between 3 People

```bash
# 1. Get CSRF token
TOKEN=$(curl -s http://localhost:3000/api/csrf | jq -r .csrfToken)

# 2. Create expense ($300 split 3 ways = $100 each)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Cookie: next-auth.session-token=$SESSION" \
  -d '{
    "groupId": "clh1234567890abcdef",
    "description": "Group dinner",
    "amount": 300,
    "category": "FOOD",
    "date": "2024-01-20T19:00:00Z",
    "splits": [
      {"userId": "user1_id", "amount": 100},
      {"userId": "user2_id", "amount": 100},
      {"userId": "user3_id", "amount": 100}
    ]
  }'
```

### Getting User's Group Balances

```bash
curl http://localhost:3000/api/groups \
  -H "Cookie: next-auth.session-token=$SESSION" | jq '.groups[] | {name, memberCount: ._count.members, expenseCount: ._count.expenses}'
```

---

## 🐛 Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Common Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions or not a group member |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Email already registered |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 📖 OpenAPI Specification

The complete OpenAPI 3.0 specification can be downloaded as JSON:

```
GET /api/swagger
```

This file can be imported into tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Bruno](https://www.usebruno.com/)

---

## 🔗 Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📞 Support

For API issues or questions:
1. Check the Swagger UI documentation at `/api-docs`
2. Review error messages and status codes
3. Check rate limit headers in response
4. Review authentication and CSRF token setup
