# 🔒 Security Documentation

## Overview

This document outlines the security measures implemented in the SplitBill application to protect against common web vulnerabilities.

---

## 1. SQL Injection Protection

### Implementation
- **Prisma ORM** is used for all database operations
- All queries use **parameterized statements** automatically
- No raw SQL queries are executed without sanitization

### How it works
Prisma automatically escapes all user input before executing queries:

```typescript
// ✅ SAFE - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userInput.email }
});

// ❌ UNSAFE - Never do this
const user = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput.email}'`
);

// ✅ SAFE - Use $queryRaw with parameters
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput.email}
`;
```

### Testing

```bash
# Try injecting SQL in email field
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com OR 1=1--", "password": "test123", "name": "Test"}'

# Expected: Validation error or safe handling
```

---

## 2. Cross-Site Scripting (XSS) Protection

### Implementation
- DOMPurify sanitizes all user input
- HTML tags are stripped from text fields
- Special characters are escaped
- Sanitization Functions

Located in `src/lib/security/sanitize.ts`:

- `sanitizeInput()` - Basic text sanitization
- `sanitizeHtml()` - HTML content sanitization
- `sanitizeObject()` - Recursive object sanitization
- `sanitizeEmail()` - Email validation and sanitization
- `sanitizeUrl()` - URL validation and sanitization

### Usage Example

```typescript
import { sanitizeObject } from '@/lib/security/sanitize';

const body = await req.json();
const sanitized = sanitizeObject(body);
// Now safe to use sanitized data
```

### Testing

```bash
# Try injecting script tag
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"name": "<script>alert(\"XSS\")</script>", "description": "Test"}'

# Expected: Script tags are stripped, only text remains
```

---

## 3. Cross-Site Request Forgery (CSRF) Protection

### Implementation
- CSRF tokens generated per session
- Token validation on state-changing operations (POST, PUT, DELETE, PATCH)
- Tokens stored in httpOnly cookies

### How it works

1. Client requests CSRF token: `GET /api/csrf`
2. Server generates token and sets cookie
3. Client includes token in `X-CSRF-Token` header
4. Server validates token matches cookie

### Usage in Frontend

```typescript
// Get CSRF token
const response = await fetch('/api/csrf');
const { csrfToken } = await response.json();

// Include in requests
await fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### Testing

```bash
# Try request without CSRF token
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group"}'

# Expected: 403 Forbidden - Invalid CSRF token
```

---

## 4. Cross-Origin Resource Sharing (CORS)

### Implementation
- Whitelist of allowed origins
- Credentials support for authenticated requests
- Preflight request handling

### Configuration
Environment variable `CORS_ORIGINS`:

```env
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

### Allowed Methods
- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

### Allowed Headers
- Content-Type
- Authorization
- X-CSRF-Token
- X-Requested-With

### Testing

```bash
# Try request from unauthorized origin
curl -X POST http://localhost:3000/api/groups \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Expected: CORS error or blocked
```

---

## 5. Rate Limiting

### Implementation
- In-memory rate limiting (production: use Redis)
- Different limits for different endpoint types
- IP-based tracking

### Rate Limits
- **Strict** (auth endpoints): 5 requests / 15 minutes
- **Standard** (API endpoints): 100 requests / 15 minutes
- **Public** (public pages): 300 requests / 15 minutes

### Response Headers
- `X-RateLimit-Limit`: 100
- `X-RateLimit-Remaining`: 95
- `X-RateLimit-Reset`: 1640000000000
- `Retry-After`: 900

### Testing

```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email": "test'$i'@test.com", "password": "test123", "name": "Test"}'
done

# Expected: After 5 requests, receive 429 Too Many Requests
```

---

## 6. Insecure Direct Object Reference (IDOR) Protection

### Implementation
- Ownership validation before resource access
- Membership validation for group resources
- Helper functions in `src/lib/security/idor.ts`

### Validation Functions
- `validateGroupAccess()` - Check group membership
- `validateGroupOwnership()` - Check group ownership
- `validateExpenseAccess()` - Check expense access
- `validateExpenseModification()` - Check modification rights

### Example

```typescript
import { validateGroupAccess } from '@/lib/security/idor';

// Before returning group data
const hasAccess = await validateGroupAccess(userId, groupId);
if (!hasAccess) {
  return createErrorResponse('Forbidden', 403);
}
```

### Testing

```bash
# Try accessing another user's group
curl http://localhost:3000/api/groups/other-user-group-id \
  -H "Cookie: next-auth.session-token=your-token"

# Expected: 403 Forbidden - Not a group member
```

---

## 7. Additional Security Measures

### 7.1 Password Security
- Minimum 8 characters
- Must contain: uppercase, lowercase, number
- Hashed with bcrypt (cost factor: 10)
- Never stored in plain text

### 7.2 Session Security
- JWT tokens with 30-day expiration
- httpOnly cookies
- Secure flag in production
- SameSite: Strict

### 7.3 Security Headers
Configured in `middleware.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: (see config)
- `Strict-Transport-Security: max-age=63072000`

### 7.4 Input Validation
- Zod schemas for all API inputs
- Type-safe validation
- Detailed error messages

### 7.5 Error Handling
- Generic error messages to users
- Detailed logging for developers
- No stack traces in production

---

## Security Checklist

- ✅ SQL Injection protection (Prisma ORM)
- ✅ XSS protection (DOMPurify sanitization)
- ✅ CSRF protection (token validation)
- ✅ CORS configuration (origin whitelist)
- ✅ Rate limiting (IP-based)
- ✅ IDOR protection (ownership validation)
- ✅ Password hashing (bcrypt)
- ✅ Secure session management (JWT)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Input validation (Zod schemas)

---

## Reporting Security Issues

If you discover a security vulnerability, please email: **security@splitbill.com**

**Do NOT create a public GitHub issue.**

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/going-to-production/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/more/security)
