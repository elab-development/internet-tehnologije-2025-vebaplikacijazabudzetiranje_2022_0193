# 💰 SplitBill - Expense Sharing Application

A modern web application for tracking and splitting expenses with friends, family, and roommates. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/splitbill)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security](#security)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Requirements Coverage](#requirements-coverage)
- [License](#license)

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure registration and login with email verification
- ✅ **Group Management** - Create and manage expense groups with invite codes
- ✅ **Expense Tracking** - Add, edit, and delete expenses with multiple split methods
- ✅ **Debt Optimization** - Automatic calculation of who owes whom (minimized transactions)
- ✅ **Multi-Currency Support** - 8 currencies with real-time exchange rates
- ✅ **Email Notifications** - Automated emails via SendGrid (registration, password reset)
- ✅ **Reports & Analytics** - Visual charts and expense statistics
- ✅ **Advanced Search** - Filter expenses by category, date, amount, description
- ✅ **User Profiles** - Manage profile, password, currency preference
- ✅ **Dashboard** - Overview of balances, expenses, and group statistics

### Split Methods
1. **Equal** - Split evenly among all participants
2. **Percentage** - Custom percentage split (0-100%)
3. **Exact** - Specify exact amount per person

### User Roles
- **USER** - Standard user (can join groups, add expenses)
- **EDITOR** - Can create and manage groups
- **ADMIN** - Full system access

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, Server/Client Components)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4
- **Charts:** Chart.js 4.5 + react-chartjs-2 5.3
- **State:** React Hooks (useState, useEffect, useContext)
- **Authentication:** NextAuth.js 4.24

### Backend
- **Runtime:** Node.js 20+
- **API:** Next.js API Routes (REST)
- **Database:** PostgreSQL 16+ (Alpine)
- **ORM:** Prisma 6.5
- **Validation:** Zod 4.3
- **Hashing:** bcryptjs 3.0 (cost 10)
- **Email:** SendGrid (@sendgrid/mail 8.1)
- **Security:** DOMPurify 3.3, helmet 8.1, rate-limit 8.2

### DevOps & Testing
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (test.yml + deploy.yml)
- **Deployment:** Vercel (recommended) / Railway / Docker
- **Testing:** Jest 30.2 + Testing Library 16.3
- **API Docs:** Swagger/OpenAPI via swagger-jsdoc

### External APIs
1. **SendGrid** - Email notifications (free: 100/day)
2. **ExchangeRate-API** - Currency conversion (free: 1,500/month)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (check: `node --version`)
- PostgreSQL 16+ or Docker
- npm/yarn
- SendGrid account (optional for email)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/your-repo/splitbill.git
cd splitbill/split-bill
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Environment Variables
```bash
cp .env.example .env
nano .env  # Edit with your values
```

**Required variables:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/splitbill"
NEXTAUTH_SECRET="<generate: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
SENDGRID_API_KEY="SG.xxx"          # Optional
EMAIL_FROM="noreply@splitbill.com"
```

#### 4. Setup Database
```bash
# Run migrations
npx prisma migrate dev

# Seed with test data (optional)
npx prisma db seed
```

#### 5. Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 🐳 Docker Setup

### Quick Start
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# With Nginx reverse proxy
docker-compose --profile with-nginx up -d
```

### Services
- **app** - Next.js application (port 3000)
- **db** - PostgreSQL database (port 5432)
- **nginx** - Reverse proxy (optional, ports 80/443)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed Docker setup.

---

## 📚 API Documentation

### Swagger UI
Interactive API documentation available at:
- **Local:** http://localhost:3000/api-docs
- **Production:** https://your-app.vercel.app/api-docs

### Quick API Overview

**Authentication:**
```bash
POST   /api/auth/register              # Register user
POST   /api/auth/login                 # Login
GET    /api/auth/verify-email          # Verify email
GET    /api/auth/forgot-password       # Reset password
```

**Groups:**
```bash
GET    /api/groups                     # List user groups
POST   /api/groups                     # Create group (EDITOR/ADMIN)
GET    /api/groups/:id                 # Get group details
PUT    /api/groups/:id                 # Update group (owner)
DELETE /api/groups/:id                 # Delete group (owner)
POST   /api/groups/:id/members         # Add member
DELETE /api/groups/:id/members/:userId # Remove member
GET    /api/groups/:id/balances        # Get balances & optimized debts
POST   /api/groups/join/[inviteCode]   # Join via invite
PATCH  /api/groups/:id/archive         # Toggle archived
POST   /api/groups/:id/transfer        # Transfer ownership
```

**Expenses:**
```bash
GET    /api/expenses?groupId=:id       # List group expenses
POST   /api/expenses                   # Create expense
GET    /api/expenses/:id               # Get expense details
PUT    /api/expenses/:id               # Update expense
DELETE /api/expenses/:id               # Delete expense
GET    /api/expenses/search            # Advanced search
```

**Reports & Analytics:**
```bash
GET    /api/reports?groupId=:id        # Get expense analytics
GET    /api/dashboard/stats            # Get dashboard stats
```

**Currency:**
```bash
GET    /api/currency/rates             # Get exchange rates
GET    /api/currency/convert           # Convert amount
GET    /api/profile/currency           # Get currency preference
PUT    /api/profile/currency           # Set currency preference
```

**Profile:**
```bash
GET    /api/profile                    # Get user profile
PATCH  /api/profile                    # Update profile
POST   /api/profile/password           # Change password
DELETE /api/profile                    # Delete account
```

### Authentication
Sessions managed via NextAuth.js cookies. Include cookie in requests:

```bash
curl http://localhost:3000/api/groups \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🚀 Deployment

### Vercel (Recommended)
Easiest deployment with automatic CI/CD:

```bash
# 1. Create Vercel account (vercel.com)
# 2. Get token and IDs
cd split-bill
vercel link

# 3. Add GitHub secrets (see docs/CI_CD_PIPELINE.md)
# 4. Push to main branch
git push origin main
# Done! GitHub Actions deploys automatically
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- **Vercel** - Full step-by-step guide
- **Railway** - Alternative cloud platform
- **Docker/VPS** - Self-hosted setup
- **Database options** - Neon, Supabase, Railway

---

## 🔒 Security

### Implemented Protections
- ✅ **SQL Injection** - Prisma ORM with parameterized queries
- ✅ **XSS** - Input sanitization (DOMPurify), output escaping
- ✅ **CSRF** - Token-based protection on state-changing operations
- ✅ **CORS** - Strict origin whitelist
- ✅ **Rate Limiting** - IP-based (5-300 req/15min depending on endpoint)
- ✅ **IDOR** - Resource ownership validation
- ✅ **Password Security** - bcrypt hashing (cost factor 10)
- ✅ **Session Security** - httpOnly cookies, secure flag
- ✅ **Authorization** - Role-based access control (USER/EDITOR/ADMIN)

### Security Features
- Input validation (Zod schemas)
- Password strength requirements (8+ chars, mixed case, number)
- Email verification before account activation
- Automatic session timeout
- Security headers (CSP, HSTS, X-Frame-Options)

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (GitHub Actions)
npm run test:ci
```

### Test Coverage
- Unit tests (validation, utilities, security)
- Integration tests (API endpoints with database)
- Component tests (React components)
- **Current coverage:** ~65%
- **Target coverage:** 50%+

### Test Examples
```bash
# Currency conversion
npm test -- currency.test.ts

# Expense splitting
npm test -- split-expense.test.ts

# Debt optimization
npm test -- optimize-debts.test.ts
```

---

## 📊 Project Structure

```
split-bill/
├── prisma/
│   ├── schema.prisma              # Database schema (entities, relations)
│   ├── migrations/                # Migration files
│   └── seed.ts                    # Seed data (test users, groups)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Auth pages (login, register, reset)
│   │   ├── (dashboard)/           # Protected pages (groups, expenses, etc.)
│   │   ├── api/                   # API routes (REST endpoints)
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── ui/                    # Reusable UI (buttons, forms, cards)
│   │   ├── currency/              # Currency selection components
│   │   └── ...                    # Feature components
│   ├── lib/
│   │   ├── auth/                  # Auth utilities, middleware
│   │   ├── currency/              # Currency conversion logic
│   │   ├── calculations/          # Debt optimization, splitting
│   │   ├── email/                 # Email templates
│   │   ├── security/              # Security utilities (sanitize, validate)
│   │   ├── db/                    # Database connection
│   │   └── utils/                 # General utilities
│   └── hooks/                     # Custom React hooks (useCurrency, etc.)
├── __tests__/
│   ├── lib/                       # Logic tests
│   └── api/                       # API endpoint tests
├── docs/
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── CI_CD_PIPELINE.md          # GitHub Actions setup
│   ├── USER_PROFILE.md            # Profile management
│   ├── SEARCH_FILTERING.md        # Search feature
│   ├── ...                        # Other features
│   └── API.md                     # API documentation
├── .github/workflows/
│   ├── deploy.yml                 # Production deployment
│   └── test.yml                   # PR testing
├── docker-compose.yml             # Multi-container setup
├── Dockerfile                     # Application image
├── vercel.json                    # Vercel configuration
├── nginx.conf                     # Nginx reverse proxy config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md                      # This file
```

---

## ✅ Requirements Coverage

### Academic Requirements - Mandatory
| Requirement | Status | Notes |
|-------------|--------|-------|
| Docker + docker-compose | ✅ | Multi-service setup with health checks |
| Swagger API documentation | ✅ | Full API docs at /api-docs |
| Database (PostgreSQL) | ✅ | Prisma ORM, migrations, seed data |
| Authentication | ✅ | NextAuth.js with email verification |
| Multiple pages | ✅ | 10+ pages (dashboard, groups, expenses, etc.) |

### Academic Requirements - Higher Grade
| Requirement | Status | Details |
|-------------|--------|---------|
| 2+ External APIs | ✅ | SendGrid (email) + ExchangeRate-API (currency) |
| Git workflow | ✅ | main, develop, feature branches |
| CI/CD pipeline | ✅ | GitHub Actions (test → build → deploy) |
| Cloud deployment | ✅ | Vercel (recommended) + Railway option |
| Security (6 protections) | ✅ | SQL injection, XSS, CSRF, CORS, rate limit, IDOR |
| Automated tests | ✅ | 65% coverage (30+ tests) |
| Data visualization | ✅ | Chart.js (pie, bar, line charts) |
| Comprehensive README | ✅ | You are here! |

### Functional Requirements
| ID | Feature | Status |
|----|---------|--------|
| F1 | User authentication & registration | ✅ |
| F2 | Group creation & management | ✅ |
| F3 | Add/edit/delete expenses | ✅ |
| F4 | Split expenses (3 methods) | ✅ |
| F5 | Debt optimization algorithm | ✅ |
| F6 | Currency conversion | ✅ |
| F7 | Email notifications | ✅ |
| F8 | Dashboard & statistics | ✅ |
| F9 | Reports & analytics (charts) | ✅ |
| F10 | Search & filtering | ✅ |
| F11 | User profile management | ✅ |

---

## 🎓 Test Credentials

For development/testing:

```
Admin:  admin@splitbill.com   / Admin123!
Editor: editor@splitbill.com  / Editor123!
User:   user@splitbill.com    / User123!
```

Created during database seeding (see `prisma/seed.ts`)

---

## 📖 Documentation

Complete documentation available in `docs/`:

- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deploy to Vercel, Railway, Docker
- [CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md) - GitHub Actions setup
- [USER_PROFILE.md](docs/USER_PROFILE.md) - Profile management API
- [SEARCH_FILTERING.md](docs/SEARCH_FILTERING.md) - Search feature
- [CURRENCY_API.md](docs/CURRENCY_API.md) - Currency conversion
- [GROUP_MANAGEMENT.md](docs/GROUP_MANAGEMENT.md) - Groups & invites
- [EXPENSE_FEATURES.md](docs/EXPENSE_FEATURES.md) - Expenses & splitting
- [DASHBOARD_REPORTS.md](docs/DASHBOARD_REPORTS.md) - Analytics & charts

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Lint TypeScript & styles

# Database
npx prisma studio      # Open Prisma Studio (GUI)
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database

# Testing
npm test               # Run all tests
npm run test:ci        # CI mode (GitHub Actions)
npm run test:coverage  # Coverage report

# Building
npm run build          # Production build
npm start              # Start production server

# Docker
docker-compose up -d   # Start services
docker-compose logs -f # View logs
docker-compose down    # Stop services
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Standards
- TypeScript strict mode
- Prettier for formatting
- ESLint for linting
- 50%+ test coverage for new code

---

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Next.js** - Amazing React framework
- **Prisma** - Excellent database ORM
- **SendGrid** - Email service
- **ExchangeRate-API** - Currency data
- **ITEH Course** - Academic project

---

## 📧 Support

For questions, issues, or suggestions:
1. Check existing [issues](https://github.com/your-repo/issues)
2. Open a new issue with details
3. Include error messages and steps to reproduce

---

## 🎉 Deployment Button

One-click deployment to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/splitbill)

---

**Built with ❤️ for ITEH course project**