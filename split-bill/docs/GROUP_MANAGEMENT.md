# 👥 Group Management Features

## Overview

Complete group management system including invitations, membership management, archiving, and ownership transfer.

---

## Features

### 1. Group Invitations

Every group has a unique invite code that allows other users to join without needing explicit approval.

**Invite Code Format:** CUID (automatically generated)

**Example:**
```
clq7j3h9z0000ppp9zzz0000q
```

#### Getting the Invite Code

```bash
# Get group details
GET /api/groups/{id}

# Response includes:
{
  "id": "group-id",
  "name": "Trip Planning",
  "inviteCode": "clq7j3h9z0000ppp9zzz0000q",
  ...
}
```

#### Sharing Invite Link

Users can copy and share this link with others:

```
https://yourdomain.com/groups/join/{inviteCode}
```

---

### 2. Joining Groups

#### API Endpoint

```
POST /api/groups/join
```

**Request:**
```json
{
  "inviteCode": "clq7j3h9z0000ppp9zzz0000q"
}
```

**Response:**
```json
{
  "message": "Successfully joined group",
  "groupId": "group-id",
  "groupName": "Trip Planning"
}
```

#### Join Page

Users can click the invite link which takes them to:

```
/groups/join/[inviteCode]
```

The page:
- Shows group invitation UI
- Has a "Join Group" button
- Auto-redirects to group page after joining
- Shows error messages if invite is invalid

#### Error Cases

| Error | Status | Reason |
|-------|--------|--------|
| Invalid invite code | 404 | Group not found |
| Already a member | 400 | User is already in the group |
| Unauthorized | 401 | User not logged in |

---

### 3. Group Archiving

Group owners can archive groups to hide them from the main list while keeping data intact.

#### Archive Group

```
PATCH /api/groups/{id}/archive
```

**Response:**
```json
{
  "message": "Group archived successfully",
  "group": {
    "id": "group-id",
    "name": "Trip Planning",
    "isArchived": true,
    ...
  }
}
```

#### Unarchive Group

Same endpoint with archived=false to unarchive:

```
PATCH /api/groups/{id}/archive
```

**Response:**
```json
{
  "message": "Group unarchived successfully",
  "group": {
    "id": "group-id",
    "name": "Trip Planning",
    "isArchived": false,
    ...
  }
}
```

#### Permissions

- ✅ **Owner:** Can archive/unarchive
- ❌ **Members:** Cannot archive
- ❌ **Non-members:** Cannot archive

---

### 4. Ownership Transfer

Group owners can transfer ownership to another group member.

#### Transfer Endpoint

```
POST /api/groups/{id}/transfer
```

**Request:**
```json
{
  "newOwnerId": "user-id"
}
```

**Response:**
```json
{
  "message": "Ownership transferred successfully",
  "group": {
    "id": "group-id",
    "ownerId": "new-user-id",
    "owner": {
      "id": "new-user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
}
```

#### Requirements

1. **New owner must:**
   - Be a group member (isPending = false)
   - Have accepted the group invitation
   - Not be the current owner

2. **Only current owner can:**
   - Transfer ownership
   - Choose the new owner

#### Error Cases

| Error | Status | Reason |
|-------|--------|--------|
| New owner not a member | 400 | User is not in the group |
| Not the owner | 403 | Only owner can transfer |
| Group not found | 404 | Invalid group ID |

---

## Usage Examples

### React Component Example

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export function GroupManagementPanel() {
  const params = useParams();
  const groupId = params.id as string;

  const [isArchiving, setIsArchiving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [members, setMembers] = useState([]);

  const handleArchive = async (groupId: string) => {
    try {
      setIsArchiving(true);
      const response = await fetch(`/api/groups/${groupId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Archive failed');

      const data = await response.json();
      console.log('Group archived:', data.group.isArchived);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    try {
      setIsTransferring(true);
      const response = await fetch(`/api/groups/${groupId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOwnerId }),
      });

      if (!response.ok) throw new Error('Transfer failed');

      const data = await response.json();
      console.log('New owner:', data.group.owner.name);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => handleArchive(groupId)}
        disabled={isArchiving}
        className="bg-yellow-600 text-white px-4 py-2 rounded"
      >
        {isArchiving ? 'Archiving...' : 'Archive Group'}
      </button>

      <select
        onChange={(e) => handleTransferOwnership(e.target.value)}
        disabled={isTransferring}
        className="px-4 py-2 border rounded"
      >
        <option value="">Transfer Ownership to...</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Copy Invite Link

```typescript
'use client';

import { useState } from 'react';

export function CopyInviteLink({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/groups/join/${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        readOnly
        value={`${window.location.origin}/groups/join/${inviteCode}`}
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        onClick={handleCopy}
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
```

---

## Database Schema

### Group Model

```prisma
model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String   @map("owner_id")
  inviteCode  String   @unique @default(cuid()) @map("invite_code")
  isArchived  Boolean  @default(false) @map("is_archived")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  owner       User          @relation("GroupOwner", fields: [ownerId], references: [id])
  members     GroupMember[]
  expenses    Expense[]
  settlements Settlement[]

  @@map("groups")
}

model GroupMember {
  id        String   @id @default(cuid())
  groupId   String   @map("group_id")
  userId    String   @map("user_id")
  isPending Boolean  @default(true) @map("is_pending")
  joinedAt  DateTime @default(now()) @map("joined_at")

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([userId, groupId])
  @@map("group_members")
}
```

---

## API Flow Diagrams

### Join Group Flow

```
User clicks invite link
        ↓
/groups/join/[inviteCode] page loads
        ↓
POST /api/groups/join with inviteCode
        ↓
Backend validates invite code
        ↓
Check if user is already member
        ↓
Create GroupMember record (isPending: false)
        ↓
Return success with groupId
        ↓
Redirect to /groups/{groupId}
```

### Archive Group Flow

```
Group owner clicks "Archive" button
        ↓
PATCH /api/groups/{id}/archive
        ↓
Verify user is owner
        ↓
Toggle isArchived field
        ↓
Return updated group
        ↓
UI updates to show archived status
```

### Transfer Ownership Flow

```
Current owner selects new owner
        ↓
POST /api/groups/{id}/transfer
        ↓
Verify current user is owner
        ↓
Verify new owner is a member
        ↓
Update group.ownerId
        ↓
Return updated group with new owner info
        ↓
UI updates to reflect new ownership
```

---

## Security Considerations

### Authentication

All endpoints require:
- ✅ User authentication (logged in)
- ✅ Valid session cookie

### Authorization

**Archive Endpoint:**
- Only group owner can archive

**Transfer Endpoint:**
- Only current owner can initiate transfer
- New owner must be an active member

**Join Endpoint:**
- Any authenticated user can join
- Duplicate membership prevented

### Validation

All endpoints validate:
- ✅ User authentication
- ✅ Group existence
- ✅ User permissions
- ✅ Member status (for transfer)
- ✅ Invite code format

---

## Testing

### Join Group

```bash
# Join valid group
curl -X POST http://localhost:3000/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"clq7j3h9z0000ppp9zzz0000q"}'

# Try to join twice (should fail)
curl -X POST http://localhost:3000/api/groups/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"clq7j3h9z0000ppp9zzz0000q"}'
```

### Archive Group

```bash
# Archive group (owner only)
curl -X PATCH http://localhost:3000/api/groups/GROUP_ID/archive \
  -H "Content-Type: application/json"

# Unarchive group
curl -X PATCH http://localhost:3000/api/groups/GROUP_ID/archive \
  -H "Content-Type: application/json"
```

### Transfer Ownership

```bash
# Transfer to new owner
curl -X POST http://localhost:3000/api/groups/GROUP_ID/transfer \
  -H "Content-Type: application/json" \
  -d '{"newOwnerId":"NEW_OWNER_ID"}'
```

---

## Error Handling

All endpoints return proper HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 500 | Server error |

### Error Response Format

```json
{
  "error": "Description of what went wrong",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Future Enhancements

- [ ] Role-based permissions (admin, moderator, member)
- [ ] Invite expiration times
- [ ] Invite acceptance workflow
- [ ] Group settings UI
- [ ] Bulk invite via email
- [ ] Activity log for ownership changes
- [ ] Group history (archived groups)
