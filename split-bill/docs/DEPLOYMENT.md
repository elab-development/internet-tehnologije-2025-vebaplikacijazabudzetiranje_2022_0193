# 🚀 Deployment Guide

## Overview

Complete guide for deploying SplitBill to production using multiple platforms: Vercel (recommended), Railway, or Docker.

---

## Vercel Deployment (Recommended)

### Why Vercel?

- ✅ Optimized for Next.js
- ✅ Free tier available
- ✅ Automatic deployments on push
- ✅ Serverless functions
- ✅ Edge locations
- ✅ Built-in analytics

### Prerequisites

1. Vercel account (https://vercel.com)
2. PostgreSQL database (Neon, Supabase, or Railway)
3. SendGrid API key
4. GitHub repository

---

## Step 1: Prepare Database

### Option A: Neon (Recommended - Free tier)

```bash
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. Format: postgresql://user:password@host.neon.tech/database?sslmode=require
```

**Get Connection String:**
- Dashboard → Project → Connection string
- Select "Pooled connection"
- Copy full URL including `?sslmode=require`

### Option B: Supabase

```bash
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection pooling
4. Copy "Transaction pooler" connection string
5. Keep as is (includes SSL)
```

### Option C: Railway

```bash
1. Go to https://railway.app
2. New Project → PostgreSQL
3. Open Postgres plugin
4. Copy DATABASE_URL from variables
5. URL already formatted correctly
```

---

## Step 2: Configure SendGrid

### Get SendGrid API Key

```bash
1. Go to https://sendgrid.com
2. Sign up (free tier available)
3. Go to Settings → API Keys
4. Create new Dynamic API Key
5. Copy the key (SG.xxx format)
6. Save securely
```

### Verify Sender Email

```bash
1. Go to Settings → Sender Authentication
2. Single Sender Verification (recommended for free tier)
3. Verify your email (check inbox for confirmation)
4. Use verified email for EMAIL_FROM
```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

```bash
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure:
   - Framework: Next.js
   - Root Directory: split-bill
   - Build Command: npm run build
   - Output Directory: .next
```

**Add Environment Variables:**

Click "Environment Variables" and add:

```
DATABASE_URL = postgresql://...
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
NEXTAUTH_URL = https://your-app.vercel.app
SENDGRID_API_KEY = SG.xxx
EMAIL_FROM = noreply@yourdomain.com
```

**Generate NEXTAUTH_SECRET:**

```bash
# On your machine
openssl rand -base64 32
# Output: abcdef123456...
# Copy and paste into Vercel environment variable
```

**Deploy:** Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from split-bill directory
cd split-bill
vercel --prod

# During setup, select:
# - Link existing project? → No
# - Project name? → splitbill
# - Root directory? → ./
# - Build command? → npm run build
# - Output directory? → .next
```

---

## Step 4: Run Initial Setup

### Run Database Migrations

```bash
# Option 1: Via Vercel CLI
vercel env pull

# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Option 2: Via GitHub Actions (automatic)

When you push to `main`, GitHub Actions will:
1. Run tests
2. Build Docker image
3. Deploy to Vercel
4. Post deployment URL

---

## Step 5: Verify Deployment

### Test Application

```bash
1. Visit https://your-app.vercel.app
2. Register a new account
3. Check email for verification
4. Login
5. Create a group
6. Add an expense
7. Test search
```

### Common Issues

**Database Connection Error:**
```
Solution: Verify DATABASE_URL format in Vercel settings
- Check for ?sslmode=require at end
- Verify credentials
- Test connection locally first
```

**Email Not Sending:**
```
Solution:
- Verify SENDGRID_API_KEY is correct
- Confirm sender email is verified in SendGrid
- Check SendGrid Activity Log
```

**Build Fails:**
```
Solution:
- Check Vercel logs for details
- Verify all environment variables set
- Run `npm run build` locally to debug
```

---

## GitHub Actions Setup

### Add GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions

Add these secrets:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Get Vercel Token

```bash
1. Go to https://vercel.com/account/tokens
2. Create new token (leave Scope as default)
3. Copy token
4. Add to GitHub as VERCEL_TOKEN
```

### Get Org & Project IDs

```bash
# After deploying via Vercel
cd split-bill
vercel link

# This creates .vercel/project.json with:
# - orgId
# - projectId

cat .vercel/project.json
# Use values for GitHub secrets
```

---

## Railway Deployment

### Why Railway?

- ✅ Easy PostgreSQL integration
- ✅ Free tier with $5 credits
- ✅ Good for learning/prototyping
- ✅ Git sync

### Deployment Steps

```bash
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project
4. Select "Deploy from GitHub repo"
5. Authorize and select your repo
```

**Add PostgreSQL:**

```bash
1. Click "New" in your project
2. Select "Database" → "PostgreSQL"
3. PostgreSQL service created
4. Copy DATABASE_URL from Variables
```

**Configure Environment:**

```bash
1. Select your service (the app)
2. Go to Variables
3. Add:
   - DATABASE_URL: from postgres service
   - NEXTAUTH_URL: https://your-project.up.railway.app
   - NEXTAUTH_SECRET: (generate as before)
   - SENDGRID_API_KEY: your-key
   - EMAIL_FROM: email@domain.com
4. Set "Root Directory": split-bill
```

**Deploy:**

```bash
1. Settings → Deployment
2. Check "Automatically deploy on push"
3. Push to GitHub
4. Railway deploys automatically
```

---

## Docker Deployment (VPS/Self-Hosted)

### Prerequisites

- VPS with Docker installed (Ubuntu recommended)
- Domain name (optional)
- SSL certificate (optional but recommended)

### Step 1: Prepare VPS

```bash
ssh user@your-server

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Clone Repository

```bash
git clone https://github.com/your-repo/splitbill.git
cd splitbill/split-bill
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit with your values
nano .env

# Required variables:
DATABASE_URL=postgresql://splitbill:password@db:5432/splitbill
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl>
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@your-domain.com
```

### Step 4: Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Step 5: Run Migrations

```bash
# Run migrations in container
docker-compose exec app npx prisma migrate deploy

# Seed database (optional)
docker-compose exec app npx prisma db seed
```

### Step 6: Setup Nginx (Optional)

Create `nginx.conf`:

```nginx
upstream app {
    server app:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL certificates (if using Let's Encrypt)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}
```

### Step 7: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy to SSL directory
sudo cp /etc/letsencrypt/live/your-domain.com/* ./ssl/

# Fix permissions
sudo chown $(whoami):$(whoami) ./ssl/*
chmod 644 ./ssl/cert.pem
chmod 644 ./ssl/chain.pem
chmod 600 ./ssl/privkey.pem
```

---

## Monitoring & Maintenance

### Health Check

```bash
# Test application is running
curl https://your-app.vercel.app/api/health

# Should return: { "status": "ok" }
```

### View Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
```bash
# Via dashboard: Deployments tab
```

**Docker:**
```bash
docker-compose logs -f app
docker-compose logs -f db
```

### Database Backup

**Neon/Supabase:** Automatic backups included

**Railway:**
```
Settings → Backups (available)
```

**Docker:**
```bash
# Manual backup
docker-compose exec db pg_dump -U splitbill splitbill > backup.sql

# Restore backup
docker-compose exec -T db psql -U splitbill splitbill < backup.sql
```

### Update Application

**Vercel:** Push to main branch (automatic)

**Railway:** Push to connected branch (automatic)

**Docker:**
```bash
git pull origin develop
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## Troubleshooting

### Build Failures

```
Error: DATABASE_URL not set
Solution: Add DATABASE_URL to environment variables

Error: Prisma client generation failed
Solution:
1. Verify prisma schema syntax
2. Run locally: npx prisma generate
3. Commit and push

Error: Dependencies not installing
Solution:
1. Clear cache: npm cache clean --force
2. Delete package-lock.json and reinstall
3. Check Node version compatibility
```

### Database Connection Errors

```
Error: Connection timeout
Solution:
1. Verify DATABASE_URL format
2. Check SSL mode (?sslmode=require)
3. Verify database credentials
4. Check firewall/network access

Error: ECONNREFUSED localhost:5432
Solution: Using wrong host for Docker
- Use: db (service name)
- Not: localhost
```

### Email Not Sending

```
Error: SENDGRID_API_KEY invalid
Solution:
1. Verify key starts with SG.
2. Check it's not revoked in SendGrid
3. Generate new key if needed

Error: Email bounced
Solution:
1. Verify sender email is authenticated in SendGrid
2. Check recipient email is valid
3. Review SendGrid activity logs
```

### Performance Issues

```
Slow response times:
1. Check database query performance
2. Enable Vercel Analytics
3. Review Lighthouse scores
4. Optimize images and assets

High memory usage:
1. Check for memory leaks in code
2. Verify Docker memory limits
3. Monitor Prisma query batching
```

---

## Production Checklist

Before going live:

```
☑ Environment variables set correctly
☑ Database migrations completed
☑ SendGrid sender verified
☑ NEXTAUTH_SECRET generated (32+ chars)
☑ NEXTAUTH_URL set to production domain
☑ SSL/HTTPS enabled
☑ Database backups configured
☑ Monitoring setup (Vercel Analytics)
☑ Error tracking (Sentry - optional)
☑ Custom domain configured
☑ CORS origins updated if needed
☑ Rate limiting configured
☑ Admin user created
☑ Tested registration and email
☑ Tested login with new account
☑ Tested currency conversion
☑ Tested expense creation
☑ Tested search functionality
☑ Tested payment settlements
☑ Security headers configured
☑ CSRF tokens working
☑ Input validation working
☑ 404 and error pages customized
☑ Privacy policy added
☑ Terms of service added
```

---

## Scaling Considerations

### Database

- **Connection pooling:** Use Vercel Postgres or Neon pooling
- **Read replicas:** Available on premium plans
- **Backups:** Enable automated backups
- **Monitoring:** Set up alerts for high connections

### Application

- **Caching:** Implement Redis for session/cache (future enhancement)
- **CDN:** Vercel includes CDN by default
- **Edge Functions:** Move logic to edge for lower latency
- **Monitoring:** Use Vercel Analytics

### Recommendations

- **Small deployments:** Vercel + Neon (free tier)
- **Medium deployments:** Vercel + Supabase (paid tier)
- **Large deployments:** Vercel + Railway or self-hosted Docker
- **Enterprise:** Self-hosted with managed PostgreSQL

---

## Security Hardening

### Environment Variables

```
Never commit .env files
Always use strong secrets (32+ chars)
Rotate secrets periodically
Use separate secrets per environment
```

### Database

```
Use strong password (20+ chars, mixed)
Enable SSL connections (?sslmode=require)
Restrict access by IP if possible
Regular backups with encryption
```

### Application

```
Enable HTTPS only
Set secure headers (CSP, X-Frame-Options, etc.)
Implement rate limiting
Keep dependencies updated
Regular security audits
```

---

## Cost Estimation

### Vercel + Neon (Recommended)

- Vercel: $0-20/month (free tier available)
- Neon: $0-150/month (free tier available)
- SendGrid: Free (up to 100 emails/day)
- **Total: $0-170/month**

### Railway

- Railway: $5-100/month (includes $5 free credits)
- SendGrid: Free
- **Total: $0-100/month**

### Docker Self-Hosted

- VPS: $5-50/month (DigitalOcean, Linode, AWS)
- Domain: $10-15/year
- SendGrid: Free
- **Total: $5-50/month**

---

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Railway Docs: https://docs.railway.app
- Neon Docs: https://neon.tech/docs
- SendGrid Docs: https://docs.sendgrid.com
- Docker Docs: https://docs.docker.com

