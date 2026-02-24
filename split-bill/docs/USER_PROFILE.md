# 👤 User Profile Management

## Overview

Comprehensive user profile management system allowing users to view, update, and manage their account settings including personal information, password management, currency preferences, and account deletion.

---

## Features

### Profile Management

Retrieve and update user profile information including:
- Name (2-50 characters)
- Bio (up to 500 characters)
- Avatar URL
- Email (read-only)
- Preferred currency
- Account creation date

### Password Security

- Secure password change with current password verification
- Password strength requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Bcrypt hashing with salt rounds 10
- Password validation before update

### Account Deletion

- Full account deletion with cascading data removal
- Permanent data loss (no recovery)
- Confirmation required before deletion

### Currency Management

- Set preferred currency for display (USD, EUR, GBP, RSD, JPY, CAD, AUD, CHF)
- Applied globally across all expense displays
- Persisted in user profile

---

## API Endpoints

### Get User Profile

```
GET /api/profile
```

**Authentication:** Required (cookieAuth)

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Doe",
    "bio": "Love traveling and sharing expenses",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "USER",
    "preferredCurrency": "USD",
    "emailVerified": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "_count": {
      "ownedGroups": 3,
      "memberships": 8
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized (not logged in)
- 500: Server error

---

### Update User Profile

```
PATCH /api/profile
```

**Authentication:** Required (cookieAuth + CSRF token)

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Traveling enthusiast",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Validation Rules:**
- name: 2-50 characters (optional)
- bio: max 500 characters, nullable
- avatarUrl: valid URL format, nullable

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Doe Updated",
    "bio": "Traveling enthusiast",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "role": "USER"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 404: User not found
- 500: Server error

---

### Change Password

```
POST /api/profile/password
```

**Authentication:** Required (cookieAuth + CSRF token)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Password Requirements:**
- Current password: min 1 character (actual password)
- New password: min 8 characters
- New password: must contain uppercase letter (A-Z)
- New password: must contain lowercase letter (a-z)
- New password: must contain number (0-9)

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

```json
{
  "error": "Current password is incorrect",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

```json
{
  "error": "Validation failed: New password must contain uppercase, lowercase, and number",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

**Status Codes:**
- 200: Success
- 400: Invalid current password or weak new password
- 401: Unauthorized
- 404: User not found
- 500: Server error

---

### Delete User Account

```
DELETE /api/profile
```

**Authentication:** Required (cookieAuth + CSRF token)

**Cascade Deletions:**
- All groups owned by user → deleted
- All group memberships → removed
- All expenses created by user → deleted
- All expense splits → removed
- All settlements → removed
- All user data → purged

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: User not found
- 500: Server error

**Important:** This action is permanent and cannot be undone.

---

## Frontend: Profile Page

**Route:** `/profile`

**Client Component:** `src/app/(dashboard)/profile/page.tsx`

### Sections

#### 1. Personal Information Card
- **Name Input** - Text field for user name (2-50 chars)
- **Bio Textarea** - 500 character limit with character count
- **Email Field** - Read-only (cannot change email)
- **Save Changes Button** - Triggers PATCH request

#### 2. Currency Preference Card
- **Currency Selector** - Dropdown with 8 currency options
- **Description** - "All amounts will be displayed in your preferred currency"
- **Auto-save** - Changes persisted immediately

#### 3. Change Password Card
- **Current Password Input** - Type: password
- **New Password Input** - Type: password with validation helper text
- **Confirm Password Input** - Type: password for verification
- **Change Password Button** - Validates passwords match before submit
- **Helper Text** - Shows password requirements

#### 4. Danger Zone Card
- **Red styling** - Visual warning with red border
- **Delete Account Button** - Requires confirmation dialog
- **Warning Text** - Clear message about permanence

### User Experience Features

- **Success Messages** - Green banner: "Profile updated successfully", "Password changed successfully"
- **Error Messages** - Red banner with error details
- **Loading States** - Button text changes to "Saving...", "Changing..." when processing
- **Confirmation Dialogs** - Before account deletion
- **Form Validation** - Client-side password matching validation
- **Auto-load Profile** - Fetches current profile data on component mount
- **Disabled States** - Email field disabled, buttons disabled during loading

### UI Components Used

- Input fields with focus ring styling
- Textarea with character limit indicator
- Select dropdown for currency
- Card containers with shadow
- Status messages (green success, red error)
- Loading spinners integrated into buttons

---

## Security Features

### Authentication
- ✅ All endpoints require user authentication (requireAuth middleware)
- ✅ User ID from auth context used for data access
- ✅ No cross-user data access possible

### CSRF Protection
- ✅ POST/PATCH/DELETE endpoints require CSRF token
- ✅ Token validated via middleware
- ✅ Form requests include token automatically

### Input Validation
- ✅ Zod schema validation for all inputs
- ✅ Name: 2-50 character length
- ✅ Bio: 500 character max
- ✅ Avatar URL: valid URL format required
- ✅ Password: strength requirements enforced
- ✅ Type coercion prevented (strict parsing)

### Data Sanitization
- ✅ All inputs sanitized via `sanitizeObject()` utility
- ✅ XSS prevention in user-provided content
- ✅ HTML special characters escaped

### Password Security
- ✅ Bcrypt hashing (salt rounds: 10)
- ✅ Current password verified before change
- ✅ Strong password requirements enforced
- ✅ Regex validation: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

### Account Deletion
- ✅ User confirmation required via client dialog
- ✅ Full cascade deletion removes all user data
- ✅ Automatic session logout after deletion
- ✅ Audit trail possible (logs cascade deletion)

---

## Data Models

### User Profile Fields

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  bio               String?
  avatarUrl         String?
  role              Role      @default(USER)
  preferredCurrency Currency  @default(USD)
  emailVerified     Boolean   @default(false)
  passwordHash      String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum Currency {
  USD
  EUR
  GBP
  RSD
  JPY
  CAD
  AUD
  CHF
}
```

### Update Payload Schema

```typescript
interface UpdateProfilePayload {
  name?: string;           // 2-50 chars
  bio?: string | null;     // max 500 chars
  avatarUrl?: string | null; // valid URL
}
```

### Password Change Schema

```typescript
interface ChangePasswordPayload {
  currentPassword: string; // existing password
  newPassword: string;     // min 8, uppercase, lowercase, number
}
```

---

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Unauthorized | 401 | Not logged in | Login required |
| User not found | 404 | Session user deleted | Re-authenticate |
| Invalid current password | 400 | Wrong password entered | Verify current password |
| Password too weak | 400 | Doesn't meet requirements | Use 8+ chars, mixed case, number |
| Validation error | 400 | Invalid input format | Check input validation rules |
| CSRF token invalid | 403 | Token expired/invalid | Refresh page and retry |

### Example Error Response

```json
{
  "error": "Current password is incorrect",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "currentPassword",
    "message": "The password you provided does not match your current password"
  },
  "status": 400
}
```

---

## Mobile Responsiveness

### Breakpoints

- **Mobile** (< 768px)
  - Single column layout
  - Full-width input fields
  - Stacked cards
  - Touch-friendly button sizes (44px+ height)

- **Tablet** (768px - 1024px)
  - Two-column sections where applicable
  - Optimized padding

- **Desktop** (> 1024px)
  - Max-width 4xl (56rem) container
  - Proper spacing between cards
  - Comfortable input widths

---

## Usage Examples

### Get Current Profile

```typescript
const response = await fetch('/api/profile');
const { user } = await response.json();

console.log(user.name);
console.log(user.preferredCurrency);
```

### Update Profile

```typescript
const response = await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    bio: 'Budget enthusiast',
  }),
});

const { user } = await response.json();
```

### Change Password

```typescript
const response = await fetch('/api/profile/password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentPassword: 'OldPass123',
    newPassword: 'NewPass456',
  }),
});

if (response.ok) {
  console.log('Password changed successfully');
}
```

### Delete Account

```typescript
const confirmed = confirm('Delete your account? This cannot be undone.');

if (confirmed) {
  const response = await fetch('/api/profile', {
    method: 'DELETE',
  });

  // Will redirect to login after deletion
}
```

---

## Caching Strategy

- **Profile Data:** No caching (always fresh)
  - User may change data frequently
  - Security-sensitive information
  - Different users access different profiles

- **Cache-Control:** `no-cache` for GET /api/profile
- **Client-side:** Load on component mount, refetch on demand

---

## Testing Scenarios

### Profile Update
```
1. Navigate to /profile
2. Enter name: "Test User"
3. Click "Save Changes"
4. Verify success message
5. Refresh and confirm persisted
```

### Password Change
```
1. Enter current password: "OldPass123"
2. Enter new password: "NewPass456"
3. Confirm new password: "NewPass456"
4. Click "Change Password"
5. Verify success message
6. Logout and login with new password
```

### Password Validation
```
1. Try password: "weak" → Error: too short
2. Try password: "nouppercase123" → Error: no uppercase
3. Try password: "NOLOWERCASE123" → Error: no lowercase
4. Try password: "NoNumbers" → Error: no number
5. Try password: "Strong123" → Success
```

### Account Deletion
```
1. Click "Delete My Account"
2. Dismiss confirmation → No action
3. Click button again, confirm
4. Verify redirect to login
5. Try logging in with deleted account → Should fail
```

### Bio Character Limit
```
1. Enter 500 character bio
2. Character count shows: "500/500"
3. Try to add more characters → Input prevents
4. Save and verify persisted
```

---

## Performance Considerations

### Queries
- **GET /api/profile:** Single user query with counts
  - Includes: group counts, membership counts
  - Response time: < 100ms (indexes on userId)

- **PATCH /api/profile:** Single update query
  - Selective fields updated
  - Response time: < 50ms

- **POST /api/profile/password:** User fetch + update
  - Bcrypt hash computation: ~100ms (salt rounds 10)
  - Total response time: 150-200ms

- **DELETE /api/profile:** Cascade delete operation
  - Can take 1-5 seconds depending on data volume
  - Affects: groups, expenses, splits, settlements
  - Recommend background job for large deletions

### Optimization Tips
- Cache user preferences locally (localStorage)
- Implement profile update debouncing (300ms)
- Show optimistic UI updates
- Use React query for server state management

---

## Future Enhancements

- [ ] Profile picture upload (not just URL)
- [ ] Social media links (Twitter, LinkedIn, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Account recovery/suspension instead of deletion
- [ ] Login activity history
- [ ] Connected devices management
- [ ] Privacy settings (profile visibility)
- [ ] Notification preferences
- [ ] Export personal data (GDPR)
- [ ] Account deactivation (temporary vs permanent)

---

## Related Documentation

- [Authentication & Security](./AUTHENTICATION.md)
- [Currency API](./CURRENCY_API.md)
- [Error Handling](./ERROR_HANDLING.md)
- [API Documentation](./API.md)

---

## Database Schema Updates

```prisma
model User {
  // ... existing fields ...
  name              String?
  bio               String?
  avatarUrl         String?
  preferredCurrency Currency @default(USD)
  passwordHash      String
  // ... relations ...
}
```

**No new migrations needed** - fields already exist from initial setup.

**Indexes:**
- Primary: `@id` on `id`
- Unique: `@unique` on `email`
- Already indexed: `id`, `email` (auth lookups)

---

## Swagger Documentation

All endpoints are fully documented in Swagger with:
- ✅ Parameter descriptions
- ✅ Request/response schemas
- ✅ Status codes
- ✅ Security requirements (auth, CSRF)
- ✅ Example values
- ✅ Validation rules

Access at: `GET /api-docs` or `/swagger-ui`

