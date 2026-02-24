# 🏗️ Architecture Overview

Detailed system architecture, design patterns, and implementation details of SplitBill.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Browser (React 19 + Next.js 15 App Router)         │  │
│  │  ├─ Pages (auth, dashboard, groups, expenses)       │  │
│  │  ├─ Components (UI, forms, charts)                  │  │
│  │  └─ Hooks (useCurrency, useSession, etc.)           │  │
│  └──────────────┬───────────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (REST)                           │  │
│  │  ├─ /api/auth/* (authentication)                     │  │
│  │  ├─ /api/groups/* (group management)                 │  │
│  │  ├─ /api/expenses/* (expense tracking)               │  │
│  │  ├─ /api/reports/* (analytics)                       │  │
│  │  ├─ /api/currency/* (currency conversion)            │  │
│  │  └─ /api/profile/* (user profile)                    │  │
│  └──────────────┬───────────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌────────┐  ┌────────┐  ┌──────────────┐
  │Database│  │SendGrid│  │ExchangeRate  │
  │Queries │  │Email   │  │API           │
  └────────┘  └────────┘  └──────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ├─ Calculations (expense splits, debt optimization)       │
│  ├─ Currency conversion                                    │
│  ├─ Email templates & sending                              │
│  ├─ Validation & sanitization                              │
│  └─ Security (auth, authorization, rate limiting)          │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Prisma ORM)                   │
│  ├─ Models (User, Group, Expense, Split, Settlement, etc.) │
│  ├─ Relations (1:N, M:N, cascading)                        │
│  ├─ Migrations (version control for schema)                │
│  └─ Queries (type-safe with auto-completion)               │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  PostgreSQL Database    │
         │  (Persistent Storage)   │
         └─────────────────────────┘
```

---

## Database Schema

### Core Models

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  bio               String?
  avatarUrl         String?
  role              Role      @default(USER)
  preferredCurrency Currency  @default(USD)
  passwordHash      String
  emailVerified     Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  ownedGroups       Group[]
  memberships       GroupMember[]
  expenses          Expense[]
  splits            ExpenseSplit[]
  settlements       Settlement[]
}

model Group {
  id                String          @id @default(cuid())
  name              String
  description       String?
  ownerId           String
  owner             User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  inviteCode        String          @unique
  isArchived        Boolean         @default(false)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  members           GroupMember[]
  expenses          Expense[]
  settlements       Settlement[]
}

model GroupMember {
  id                String    @id @default(cuid())
  groupId           String
  group             Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  isPending         Boolean   @default(false)
  role              Role      @default(USER)
  joinedAt          DateTime  @default(now())

  @@unique([groupId, userId])
}

model Expense {
  id                String          @id @default(cuid())
  groupId           String
  group             Group           @relation(fields: [groupId], references: [id], onDelete: Cascade)
  payerId           String
  payer             User            @relation(fields: [payerId], references: [id], onDelete: Cascade)
  description       String
  amount            Decimal         @db.Numeric(12, 2)
  category          ExpenseCategory
  splitMethod       SplitMethod     @default(EQUAL)
  date              DateTime
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  splits            ExpenseSplit[]
}

model ExpenseSplit {
  id                String    @id @default(cuid())
  expenseId         String
  expense           Expense   @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount            Decimal   @db.Numeric(12, 2)
  percentage        Decimal?  @db.Numeric(5, 2)

  @@unique([expenseId, userId])
}

model Settlement {
  id                String    @id @default(cuid())
  groupId           String
  group             Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  fromUserId        String
  fromUser          User      @relation(fields: [fromUserId], references: [id], onDelete: Cascade)
  toUserId          String
  toUser            User      @relation(fields: [toUserId], references: [id], onDelete: Cascade)
  amount            Decimal   @db.Numeric(12, 2)
  description       String?
  status            SettlementStatus @default(PENDING)
  settledAt         DateTime?
  createdAt         DateTime  @default(now())
}

enum Role {
  USER
  EDITOR
  ADMIN
}

enum ExpenseCategory {
  FOOD
  TRANSPORT
  ACCOMMODATION
  ENTERTAINMENT
  BILLS
  OTHER
}

enum SplitMethod {
  EQUAL
  PERCENTAGE
  EXACT
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

enum SettlementStatus {
  PENDING
  COMPLETED
  CANCELLED
}
```

---

## API Endpoint Architecture

### Authentication Routes
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Group Management Routes
```
GET    /api/groups
POST   /api/groups
GET    /api/groups/:id
PUT    /api/groups/:id
DELETE /api/groups/:id
GET    /api/groups/:id/members
POST   /api/groups/:id/members
DELETE /api/groups/:id/members/:userId
GET    /api/groups/:id/balances
POST   /api/groups/:id/settlements
POST   /api/groups/:id/transfer
PATCH  /api/groups/:id/archive
POST   /api/groups/join/:inviteCode
```

### Expense Routes
```
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/search
```

### Reporting Routes
```
GET    /api/reports
GET    /api/dashboard/stats
```

### Currency Routes
```
GET    /api/currency/rates
GET    /api/currency/convert
GET    /api/profile/currency
PUT    /api/profile/currency
```

### Profile Routes
```
GET    /api/profile
PATCH  /api/profile
POST   /api/profile/password
DELETE /api/profile
```

---

## Data Flow Diagrams

### 1. Expense Creation Flow

```
┌─────────┐
│  User   │
│(Browser)│
└────┬────┘
     │ 1. Fill expense form
     │    - Amount: 100
     │    - Category: FOOD
     │    - Participants: [Alice, Bob, Charlie]
     │    - Split: EQUAL
     │
     ▼
┌─────────────────┐
│ Frontend Form   │
│ Validation      │ ← Zod schema validation
└────┬────────────┘
     │ 2. POST /api/expenses
     │    {
     │      amount: 100,
     │      category: FOOD,
     │      description: "Dinner",
     │      splits: [
     │        { userId: alice, amount: 33.33 },
     │        { userId: bob, amount: 33.33 },
     │        { userId: charlie, amount: 33.34 }
     │      ]
     │    }
     │
     ▼
┌──────────────────────┐
│ API Route Handler    │
│ /api/expenses        │ ← requireAuth middleware
└────┬─────────────────┘
     │ 3. Input validation
     │    - Parse amount (Decimal)
     │    - Validate category enum
     │    - Check participants exist
     │    - Verify user is group member
     │
     ▼
┌──────────────────────┐
│ Business Logic       │
│ calculateSplit()     │ ← Compute split amounts
└────┬─────────────────┘
     │ 4. Database operations
     │    - Create Expense record
     │    - Create 3 ExpenseSplit records
     │    - Trigger email notifications
     │
     ▼
┌──────────────────────┐
│ Database            │
│ (Prisma)            │ ← Transactional write
└────┬─────────────────┘
     │ 5. Update balances
     │    (via optimizeDebts on-demand)
     │
     ▼
┌──────────────────────┐
│ Email Notifications  │
│ (SendGrid)           │ ← Async email
└──────────────────────┘

Result: JSON response with created expense
```

### 2. Debt Optimization Flow

```
┌─────────────────────────────────────┐
│  Get Group Balances Request         │
│  GET /api/groups/:id/balances       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Fetch Expenses for Group           │
│  Select all expense splits          │
└─────────────┬───────────────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ calculateBalances()     │
    │ - Sum user owings       │
    │ - Sum user owed         │
    │ - Net balance per user  │
    └─────────────┬───────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │ optimizeDebts()         │
    │ Greedy algorithm:       │
    │ 1. Creditors: sort desc │
    │ 2. Debtors: sort asc    │
    │ 3. Match & reduce       │
    │ 4. Create settlements   │
    └─────────────┬───────────┘
                  │
    ┌─────────────▼───────────────┐
    │ Result: Min transactions    │
    │                             │
    │ Alice ← $50 ← Bob           │
    │ Alice ← $30 ← Charlie       │
    │ (vs 3 transactions)         │
    └─────────────────────────────┘

Result: optimized debts array
```

### 3. Currency Conversion Flow

```
┌──────────────────────────────────┐
│  User Requests Report            │
│  Group currency: USD             │
│  User preference: EUR            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Fetch Expense Amounts (USD)     │
│  - Total: 1000 USD               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Check Cache                     │
│  ExchangeRate cache (1-hour TTL) │
└──────────┬───────────────────────┘
           │
      Has? │ Yes ───────┐
      No? │             │
           │             ▼
           ▼        ┌──────────────┐
  ┌──────────────┐  │  Use Cached  │
  │ Call API     │  │  Rates       │
  │ exchangerate-│  └──────┬───────┘
  │ api.com      │         │
  │ /v4/latest   │         │
  └──────┬───────┘         │
         │                 │
         ▼                 │
  ┌──────────────┐         │
  │ Cache Result │         │
  │ (1 hour TTL) │         │
  └──────┬───────┘         │
         │                 │
         └─────────┬───────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Rate: 0.92       │
         │ USD/EUR          │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Convert:         │
         │ 1000 * 0.92      │
         │ = 920 EUR        │
         └──────────────────┘

Result: Converted amount in user's preferred currency
```

---

## Security Layers

### Layer 1: Transport
```
- HTTPS/TLS encryption
- Secure headers (HSTS, CSP, X-Frame-Options)
- SameSite cookies
```

### Layer 2: Authentication
```
- Email verification
- NextAuth.js sessions
- httpOnly cookie tokens
- Secure password hashing (bcrypt cost 10)
```

### Layer 3: Authorization
```
- requireAuth middleware (all endpoints)
- Role-based access control (USER/EDITOR/ADMIN)
- Resource ownership validation (IDOR protection)
```

### Layer 4: Input Validation
```
- Zod schema validation
- Type coercion prevention
- Enum validation
- Range checks (min/max)
```

### Layer 5: Sanitization
```
- DOMPurify for HTML content
- Input trimming
- Special character escaping
```

### Layer 6: Rate Limiting
```
- IP-based rate limiting
- Different limits per endpoint
  - Auth: 5 req/15min
  - API: 100 req/15min
  - Search: 300 req/15min
```

---

## Caching Strategy

### Client-Side Caching
```typescript
// React Query / SWR pattern
useSWR('/api/profile', fetch) // Revalidate on focus

// LocalStorage
localStorage.setItem('preferredCurrency', 'EUR')
```

### Server-Side Caching

**5-minute cache:**
- Dashboard stats
- Group balances
- Report data
```
Cache-Control: max-age=300
```

**1-hour cache:**
- Exchange rates (external API)
```
Cache-Control: max-age=3600
```

**No cache:**
- Search results
- User profile
- Authentication
```
Cache-Control: no-cache
```

### Cache Invalidation
```typescript
// Revalidate on data changes
onSuccess: () => {
  mutate('/api/groups/:id/balances')
  mutate('/api/dashboard/stats')
}
```

---

## Error Handling Strategy

### Frontend Error Handling
```typescript
try {
  const response = await fetch(url)

  if (!response.ok) {
    const { error, code } = await response.json()
    throw new AppError(error, code)
  }

  return response.json()
} catch (err) {
  // Display user-friendly error
  // Log to monitoring service
  // Suggest actions (retry, refresh, etc.)
}
```

### Backend Error Handling
```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Database error
  } else if (error instanceof ValidationError) {
    // Input validation error
  } else {
    // Unknown error (log + return 500)
  }
}
```

### Error Response Format
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "status": 404,
  "details": {
    "field": "userId",
    "message": "The specified user does not exist"
  }
}
```

---

## Testing Strategy

### Unit Tests
- Isolated function testing
- No database/API calls
- Fast execution

**Examples:**
```typescript
// Currency conversion
convertAmount(100, 'USD', 'EUR', 0.92) → 92

// Expense splitting
calculateSplit(100, [alice, bob, charlie], 'EQUAL')
  → [33.33, 33.33, 33.34]

// Debt optimization
optimizeDebts({...}) → [...minified settlements]
```

### Integration Tests
- Database involved
- API endpoint testing
- External services mocked

**Examples:**
```typescript
POST /api/expenses with valid data
  → Creates Expense + ExpenseSplits
  → Returns 201 with created data

GET /api/groups/:id/balances
  → Calculates all balances
  → Returns optimized debts
```

### Component Tests
- React component rendering
- User interactions
- Props & state management

**Examples:**
```typescript
<ExpenseForm />
  → Renders form inputs
  → Validates on submit
  → Calls onSubmit callback
```

---

## Deployment Architecture

### Development
```
npm run dev
↓
Next.js dev server (hot reload)
↓
http://localhost:3000
```

### Production (Vercel)
```
git push main
↓
GitHub Actions workflow
├─ Test job (3-5 min)
├─ Build job (2-3 min)
└─ Deploy job (2-5 min)
↓
Vercel deployment
├─ Serverless functions
├─ Edge network
└─ Automatic SSL
↓
https://splitbill.vercel.app
```

### Self-Hosted (Docker)
```
docker-compose up -d
↓
├─ PostgreSQL container
├─ Next.js container
└─ Nginx container (optional)
↓
http://localhost:3000
(with SSL if using Nginx)
```

---

## Performance Optimization

### Frontend
- Code splitting (Next.js automatic)
- Image optimization
- CSS minification (Tailwind)
- Lazy loading of charts
- React.memo for expensive components

### Backend
- Query optimization (includes, selects)
- Database indexing (userId, groupId, etc.)
- Batch operations where possible
- Connection pooling (Vercel/Railway)
- Rate limiting for protection

### Database
- Indexed columns: id, email, userId, groupId
- Composite indexes for common filters
- Efficient pagination (limit + offset)
- Materialized views for reports (optional future)

---

## Scalability Considerations

### Current Architecture
- Single Node.js process (fine for <1000 users)
- Single PostgreSQL database (fine for <10GB)
- No caching layer (Redis optional)

### Scaling Path
1. **Phase 1:** Horizontal scaling with load balancer
2. **Phase 2:** Redis cache layer (sessions, rates)
3. **Phase 3:** Read replicas for reports
4. **Phase 4:** Microservices (optional)

---

## Technology Decisions

### Why Next.js?
- ✅ Full-stack framework (frontend + API)
- ✅ Server/Client components
- ✅ Built-in performance optimizations
- ✅ Excellent TypeScript support
- ✅ Simple deployment to Vercel

### Why PostgreSQL?
- ✅ ACID compliance (financial data)
- ✅ Complex queries (reports, analytics)
- ✅ Excellent Prisma support
- ✅ Open source & free
- ✅ Mature & reliable

### Why Prisma?
- ✅ Type-safe ORM
- ✅ Automatic migrations
- ✅ Excellent DX
- ✅ Relations handling
- ✅ Query optimization

### Why SendGrid?
- ✅ Free tier (100 emails/day)
- ✅ Excellent deliverability
- ✅ Simple API
- ✅ Webhook support
- ✅ No infrastructure needed

---

## Conclusion

SplitBill uses a modern, scalable architecture with:
- **Frontend:** React with Next.js (SSR + SSG)
- **Backend:** API Routes with business logic
- **Database:** PostgreSQL with Prisma ORM
- **Security:** Multi-layer protection
- **Testing:** Unit + Integration + Component
- **Deployment:** Serverless (Vercel) or self-hosted (Docker)

This architecture supports the current MVP and can scale to support thousands of users with minimal changes.

