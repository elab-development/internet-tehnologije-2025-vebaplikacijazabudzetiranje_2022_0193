# ⚡ Quick Start Guide

Get SplitBill up and running in 5 minutes.

---

## Option 1: Local Development (Node.js)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- 5 minutes

### Steps

#### 1. Clone & Install (2 min)
```bash
git clone https://github.com/your-repo/splitbill.git
cd splitbill/split-bill
npm install
```

#### 2. Setup Database (2 min)
```bash
# With Docker
docker run -d \
  -e POSTGRES_USER=splitbill \
  -e POSTGRES_PASSWORD=splitbill \
  -e POSTGRES_DB=splitbill \
  -p 5432:5432 \
  postgres:16-alpine

# Setup environment
cp .env.example .env

# Run migrations
npx prisma migrate dev
```

#### 3. Start Server (1 min)
```bash
npm run dev
```

**Done!** Visit http://localhost:3000

---

## Option 2: Docker (Recommended)

### Prerequisites
- Docker & Docker Compose
- 3 minutes

### Steps

```bash
# 1. Clone
git clone https://github.com/your-repo/splitbill.git
cd splitbill/split-bill

# 2. Setup environment
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Run migrations (wait 30s for database)
sleep 30
docker-compose exec app npx prisma migrate deploy
```

**Done!** Visit http://localhost:3000

**View logs:**
```bash
docker-compose logs -f app
```

---

## Option 3: Deploy to Vercel (1 minute)

### Prerequisites
- GitHub account
- Vercel account

### Steps

1. **Fork repository** on GitHub
2. **Go to https://vercel.com/new**
3. **Import your fork**
4. **Add environment variables:**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.vercel.app
   SENDGRID_API_KEY=SG.xxx (optional)
   EMAIL_FROM=noreply@your-domain.com
   ```
5. **Click Deploy**

**Done!** Your app is live!

---

## Test Account

Login with test credentials:

```
Email:    user@splitbill.com
Password: User123!
```

Or register a new account.

---

## Common Tasks

### Create a Group
1. Login
2. Click "Create Group" on dashboard
3. Enter group name
4. Share invite code with friends

### Add an Expense
1. Go to group
2. Click "Add Expense"
3. Enter details (description, amount, category)
4. Select participants
5. Choose split method (equal, percentage, exact)
6. Save

### View Analytics
1. Go to group
2. Click "Reports"
3. See charts and statistics

### Search Expenses
1. Click "Search" in navigation
2. Enter filters (description, category, date range, amount)
3. Click "Search"

---

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=any-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
```

### Optional (Email)
```env
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@splitbill.com
```

### Optional (Currency)
```env
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Verify PostgreSQL is running
psql -U splitbill -h localhost

# Or use Docker
docker-compose up db -d
```

### Migrations Failed
```bash
# Reset database (CAUTION: deletes data)
npx prisma migrate reset

# Or run specific migration
npx prisma migrate deploy
```

### Tests Failing
```bash
# Setup test database
docker run -d -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test -p 5433:5432 postgres:16-alpine

# Update .env.test
DATABASE_URL=postgresql://test:test@localhost:5433/test

# Run tests
npm test
```

---

## Next Steps

- Read [README.md](../README.md) for full overview
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- See [API documentation](../README.md#api-documentation)
- View [project structure](../README.md#project-structure)

---

## Need Help?

- Check [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub
- Read full documentation in `docs/`

**Happy splitting! 💰**

