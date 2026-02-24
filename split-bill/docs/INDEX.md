# 📚 Documentation Index

Complete documentation for SplitBill application.

---

## 🚀 Getting Started

**New to SplitBill?** Start here:

1. [QUICK_START.md](./QUICK_START.md) ⚡
   - 5-minute setup guide
   - Local development
   - Docker setup
   - Vercel deployment

2. [README.md](../README.md) 📖
   - Project overview
   - Features overview
   - Tech stack
   - Quick commands

---

## 🏗️ Architecture & Design

Understanding the system structure:

1. [ARCHITECTURE.md](./ARCHITECTURE.md)
   - System architecture diagram
   - Database schema
   - API endpoint structure
   - Data flow diagrams
   - Security layers
   - Performance optimization
   - Technology decisions

---

## 🚀 Deployment & DevOps

Getting to production:

1. [DEPLOYMENT.md](./DEPLOYMENT.md) (800+ lines)
   - Vercel deployment (recommended)
   - Railway alternative
   - Docker self-hosted
   - Database setup (Neon, Supabase, Railway)
   - SSL with Let's Encrypt
   - Monitoring & maintenance
   - Troubleshooting
   - Production checklist

2. [CI_CD_PIPELINE.md](./CI_CD_PIPELINE.md) (600+ lines)
   - GitHub Actions workflows
   - Test workflow (PR validation)
   - Deploy workflow (production)
   - GitHub Secrets setup
   - Docker image building
   - Performance optimization
   - Cost analysis

---

## 💻 API Documentation

REST API endpoints and usage:

1. [API.md](./API.md) (if exists, see README for overview)
   - Authentication endpoints
   - Group management API
   - Expense tracking API
   - Reports & analytics API
   - Currency API
   - Profile API

**Or visit:**
- Local Swagger UI: http://localhost:3000/api-docs
- See [QUICK_START.md - API Overview](./QUICK_START.md#quick-api-overview)

---

## 🎯 Feature Documentation

Detailed feature implementations:

### User Management
- [USER_PROFILE.md](./USER_PROFILE.md) (500+ lines)
  - Profile management API
  - Password change
  - Account deletion
  - Currency preferences
  - Security features
  - Error handling

### Group Management
- [GROUP_MANAGEMENT.md](./GROUP_MANAGEMENT.md)
  - Group creation
  - Invite codes
  - Member management
  - Archive functionality
  - Ownership transfer

### Expense Tracking
- [EXPENSE_FEATURES.md](./EXPENSE_FEATURES.md) (500+ lines)
  - Expense creation
  - Split methods (Equal, Percentage, Exact)
  - Debt optimization algorithm
  - Balance calculation
  - Settlement tracking
  - Testing scenarios

### Search & Filtering
- [SEARCH_FILTERING.md](./SEARCH_FILTERING.md) (450+ lines)
  - Text search
  - Category filtering
  - Date range filtering
  - Amount range filtering
  - Pagination
  - Performance optimization

### Analytics & Reporting
- [DASHBOARD_REPORTS.md](./DASHBOARD_REPORTS.md)
  - Dashboard overview
  - Statistics & KPIs
  - Reports generation
  - Charts (pie, bar, line)
  - Export functionality

### Currency Management
- [CURRENCY_API.md](./CURRENCY_API.md) (250+ lines)
  - Real-time rates
  - Currency conversion
  - Caching strategy
  - Supported currencies
  - External API integration

### Email Features
- [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md) (if exists)
  - Email templates
  - SendGrid integration
  - Verification emails
  - Notifications
  - Error handling

---

## 🔒 Security & Compliance

Security implementation details:

### Security Guides
- **Input Validation** - See [ARCHITECTURE.md - Security Layers](./ARCHITECTURE.md#security-layers)
- **Authentication** - See [USER_PROFILE.md - Security Features](./USER_PROFILE.md#security-features)
- **Authorization** - See [ARCHITECTURE.md - Authorization](./ARCHITECTURE.md#layer-3-authorization)
- **Rate Limiting** - See [ARCHITECTURE.md - Rate Limiting](./ARCHITECTURE.md#layer-6-rate-limiting)

### OWASP Top 10
- ✅ SQL Injection (Prisma ORM)
- ✅ XSS (DOMPurify sanitization)
- ✅ CSRF (Token protection)
- ✅ Authentication (NextAuth.js)
- ✅ Broken Access Control (IDOR protection)
- ✅ Sensitive Data Exposure (HTTPS/SSL)

---

## 🧪 Testing

Testing documentation:

- **Unit Tests** - See [ARCHITECTURE.md - Unit Tests](./ARCHITECTURE.md#unit-tests)
- **Integration Tests** - See [ARCHITECTURE.md - Integration Tests](./ARCHITECTURE.md#integration-tests)
- **Component Tests** - See [ARCHITECTURE.md - Component Tests](./ARCHITECTURE.md#component-tests)
- **Test Coverage** - Run `npm run test:coverage`

### Testing Commands
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run test:ci      # CI mode (GitHub Actions)
```

---

## 📊 Database

Database documentation:

### Schema
- See [ARCHITECTURE.md - Database Schema](./ARCHITECTURE.md#database-schema)
- Interactive: `npx prisma studio`

### Migrations
```bash
npx prisma migrate dev      # Create & run migration
npx prisma migrate deploy   # Run in production
npx prisma db seed         # Seed test data
```

### Models
1. User (authentication & profile)
2. Group (group creation & management)
3. GroupMember (group membership)
4. Expense (expense tracking)
5. ExpenseSplit (split calculation)
6. Settlement (debt settlement)

---

## 🛠️ Development

Development guides:

### Local Setup
1. [QUICK_START.md](./QUICK_START.md) - 5-minute setup
2. [README.md](../README.md) - Full overview

### Project Structure
- See [README.md - Project Structure](../README.md#project-structure)

### Common Tasks
```bash
npm run dev              # Start dev server
npm run build           # Production build
npm start               # Start prod server
npx prisma studio      # Database GUI
npm test               # Run tests
docker-compose up -d   # Start with Docker
```

### Code Style
- TypeScript strict mode
- Prettier formatting
- ESLint linting
- Tailwind CSS styling

---

## 🐳 Docker

Container documentation:

### Quick Reference
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Reset (delete data)
docker-compose down -v
```

See [DEPLOYMENT.md - Docker Deployment](./DEPLOYMENT.md#docker-deployment-vps)

---

## 📱 Frontend

Frontend implementation:

### Pages
- Authentication (register, login, verify, reset)
- Dashboard (overview, stats)
- Groups (create, manage, members)
- Expenses (create, edit, search)
- Reports (analytics, charts)
- Profile (settings, password, currency)

### Components
- UI components (buttons, forms, cards)
- Currency selector
- Chart components
- Form validations

### Hooks
- useCurrency (currency management)
- useSession (authentication)
- Custom hooks for API calls

---

## 📈 Performance

Performance optimization:

- See [ARCHITECTURE.md - Performance Optimization](./ARCHITECTURE.md#performance-optimization)
- Code splitting (Next.js automatic)
- Image optimization
- CSS minification
- Database query optimization
- Caching strategy

---

## 🌐 External APIs

Integration with external services:

1. **SendGrid** - Email notifications
   - 100 free emails/day
   - See [DEPLOYMENT.md - SendGrid Setup](./DEPLOYMENT.md#configure-sendgrid)

2. **ExchangeRate-API** - Currency conversion
   - 1,500 free requests/month
   - See [CURRENCY_API.md](./CURRENCY_API.md)

---

## 🚨 Troubleshooting

Common issues and solutions:

1. [QUICK_START.md - Troubleshooting](./QUICK_START.md#troubleshooting)
   - Port in use
   - Database connection
   - Migrations failed
   - Tests failing

2. [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#troubleshooting)
   - Build failures
   - Database errors
   - Email issues
   - Performance problems

---

## 📋 Academic Requirements

Fulfillment checklist:

### Mandatory ✅
- Docker + docker-compose
- Swagger documentation
- PostgreSQL database
- Authentication system
- Multiple pages

### Higher Grade ✅
- 2+ external APIs (SendGrid, ExchangeRate)
- Git workflow (main, develop, feature/*)
- CI/CD pipeline (GitHub Actions)
- Cloud deployment (Vercel)
- Security features (6 protections)
- Automated tests (65% coverage)
- Data visualization (Chart.js)
- Comprehensive documentation

See [README.md - Requirements Coverage](../README.md#requirements-coverage)

---

## 🎓 Learning Resources

Understanding the tech stack:

### Next.js
- https://nextjs.org/docs
- App Router documentation
- Server/Client components

### TypeScript
- https://www.typescriptlang.org/docs
- Type safety guide
- Advanced types

### Prisma
- https://www.prisma.io/docs
- ORM concepts
- Relations & migrations

### PostgreSQL
- https://www.postgresql.org/docs
- SQL guide
- Performance tuning

### React
- https://react.dev
- Hooks guide
- Component patterns

### Tailwind CSS
- https://tailwindcss.com/docs
- Utility-first CSS
- Responsive design

---

## 📞 Support & Contribution

Getting help:

1. **Check Documentation** - You're here! Search this index
2. **Check README** - See [README.md](../README.md)
3. **Run Tests** - Verify setup: `npm test`
4. **Check Logs** - `npm run dev` or `docker-compose logs -f app`
5. **Open Issue** - GitHub issues with details & reproduction steps

### Contributing
1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `npm test`
5. Push and open PR

---

## 📄 Summary

**Documentation Files:**
- README.md (project overview)
- QUICK_START.md (5-min setup)
- ARCHITECTURE.md (system design)
- DEPLOYMENT.md (production setup)
- CI_CD_PIPELINE.md (GitHub Actions)
- USER_PROFILE.md (profile management)
- SEARCH_FILTERING.md (search feature)
- CURRENCY_API.md (currency conversion)
- EXPENSE_FEATURES.md (expense tracking)
- DASHBOARD_REPORTS.md (analytics)
- GROUP_MANAGEMENT.md (groups)
- **You are here:** INDEX.md (this file)

**Quick Navigation:**
- 🚀 Getting started? → [QUICK_START.md](./QUICK_START.md)
- 🏗️ Understanding architecture? → [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🚀 Deploy to production? → [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🔧 CI/CD setup? → [CI_CD_PIPELINE.md](./CI_CD_PIPELINE.md)
- 💻 API documentation? → See Swagger or [README.md](../README.md#api-documentation)

---

**Last Updated:** 2026-02-24
**Version:** 1.0
**Status:** ✅ Complete

Happy developing! 💰

