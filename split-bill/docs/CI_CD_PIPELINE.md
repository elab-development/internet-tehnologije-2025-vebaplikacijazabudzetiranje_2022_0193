# 🔄 CI/CD Pipeline Documentation

## Overview

Complete CI/CD pipeline with GitHub Actions for automated testing, Docker image building, and production deployment to Vercel.

---

## GitHub Actions Workflows

### 1. Test Workflow (test.yml)

**Trigger:** On every Pull Request to `develop` or `main`

**Purpose:** Run tests and validate code quality

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Generate Prisma Client
5. Run database migrations
6. Execute test suite with coverage
7. Upload coverage to Codecov

**Services:**
- PostgreSQL 16 (test database)

**Environment Variables:**
```
DATABASE_URL: postgresql://test:test@localhost:5432/test
NEXTAUTH_SECRET: test-secret
NEXTAUTH_URL: http://localhost:3000
```

**Duration:** ~3-5 minutes

**Artifacts:**
- Test coverage reports
- Coverage uploaded to Codecov

---

### 2. Deploy Workflow (deploy.yml)

**Trigger:** On push to `main` branch

**Purpose:** Build, test, and deploy to production

**Jobs:**

#### Job 1: Test
- Runs full test suite
- Must pass before proceeding to build
- Same as PR test workflow

#### Job 2: Build Docker Image
- **Needs:** test job to pass
- **Steps:**
  1. Setup Docker Buildx
  2. Login to GitHub Container Registry (GHCR)
  3. Build and push Docker image
  4. Tag: `:latest` and `:SHA`
  5. Cache layers for faster rebuilds

**Tags:**
```
ghcr.io/your-org/splitbill:latest
ghcr.io/your-org/splitbill:abc123def (commit SHA)
```

#### Job 3: Deploy to Vercel
- **Needs:** test and build jobs to pass
- **Steps:**
  1. Deploy to Vercel production
  2. Comment deployment URL on commit
  3. Post success/failure status

**Output:**
- Production deployment URL
- Commit comment with deployment status

---

## GitHub Secrets Required

Add these to GitHub Settings → Secrets and variables → Actions:

### For Docker Build
```
GITHUB_TOKEN: (automatic, no setup needed)
```

### For Vercel Deployment
```
VERCEL_TOKEN: Your Vercel API token
VERCEL_ORG_ID: Your Vercel organization ID
VERCEL_PROJECT_ID: Your Vercel project ID
```

---

## Setup Instructions

### Step 1: Generate Vercel Token

```bash
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Leave Scope as default (all)
4. Copy token
```

### Step 2: Get Vercel IDs

```bash
cd split-bill
vercel link

# This creates .vercel/project.json
cat .vercel/project.json
# Output:
# {
#   "orgId": "your-org-id",
#   "projectId": "your-project-id"
# }
```

**Note:** Don't commit `.vercel/project.json` to git (already in .gitignore)

### Step 3: Add GitHub Secrets

```bash
1. Go to GitHub repo
2. Settings → Secrets and variables → Actions
3. Add new repository secrets:
   - VERCEL_TOKEN: <paste-your-token>
   - VERCEL_ORG_ID: <paste-org-id>
   - VERCEL_PROJECT_ID: <paste-project-id>
```

### Step 4: Test Workflow

```bash
# Create a PR to test workflow
git checkout -b test-ci
echo "# Test PR" >> README.md
git add README.md
git commit -m "Test CI workflow"
git push origin test-ci

# Go to GitHub, create PR
# Watch Actions tab for workflow execution
```

---

## Docker Build Details

### Image Name
```
ghcr.io/your-repo/splitbill:latest
ghcr.io/your-repo/splitbill:a1b2c3d (commit SHA)
```

### Build Context
```
./split-bill (from repository root)
```

### Dockerfile Location
```
./split-bill/Dockerfile
```

### Build Arguments
```
None (uses environment variables from .env)
```

### Image Size
```
Typical: ~500MB-1GB (Next.js + dependencies)
```

### Caching
```
GitHub Actions cache (type=gha)
Reduces rebuild time: ~2-3 minutes (vs 10+ first build)
```

---

## Vercel Deployment Details

### Deployment Target
```
Production environment
https://your-app.vercel.app
```

### Build Command
```
npm run build
```

### Start Command
```
npm start
```

### Environment Variables
Configured in `vercel.json`:
```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url",
    "SENDGRID_API_KEY": "@sendgrid-api-key",
    "EMAIL_FROM": "@email-from"
  }
}
```

These reference Vercel environment variables (prefixed with `@`)

### Deployment Time
```
Typical: 2-5 minutes
Includes: Build + deployment + health checks
```

### Rollback
```
Automatic if health checks fail
Manual rollback available in Vercel dashboard
```

---

## Pipeline Flow Diagram

```
┌─────────────────────┐
│  Push to main       │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Run Tests    │ (3-5 min)
    │ - Unit tests │
    │ - Integration│
    │ - Coverage   │
    └──────┬───────┘
           │
    ┌──────▼───────────────────┐
    │  Build Docker Image      │ (2-3 min)
    │  - Build Next.js app     │
    │  - Push to GHCR          │
    │  - Tag: latest + SHA     │
    └──────┬────────────────────┘
           │
    ┌──────▼───────────────────┐
    │  Deploy to Vercel        │ (2-5 min)
    │  - Run migrations        │
    │  - Health check          │
    │  - Comment deployment URL│
    └──────┬────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Production  │ ✅
    │  Live        │
    └──────────────┘
```

---

## Troubleshooting

### Tests Fail

**Error:** `DATABASE_URL not set`
```
Solution: Add DATABASE_URL to GitHub environment
Check: .github/workflows/test.yml env section
```

**Error:** `Prisma migration failed`
```
Solution:
1. Run locally: npx prisma migrate dev
2. Commit migration files
3. Push and retry workflow
```

**Error:** `Jest tests timeout`
```
Solution:
1. Increase jest timeout in jest.config.js
2. Check for unresolved promises
3. Mock external API calls
```

### Docker Build Fails

**Error:** `Failed to push image`
```
Solution:
1. Verify GITHUB_TOKEN available
2. Check GHCR permissions
3. Verify image name format
```

**Error:** `Build layer cache invalid`
```
Solution:
1. Clear cache: gh actions-cache delete -a
2. Rerun workflow
3. First run will be slower
```

### Vercel Deployment Fails

**Error:** `VERCEL_TOKEN invalid`
```
Solution:
1. Regenerate token at https://vercel.com/account/tokens
2. Update GitHub secret
3. Rerun workflow
```

**Error:** `Build command failed`
```
Solution:
1. Check Vercel logs: vercel logs
2. Verify environment variables set
3. Run npm run build locally to debug
4. Check for build-time errors
```

**Error:** `Health check failed`
```
Solution:
1. Application not responding on :3000
2. Check database connection
3. Verify NEXTAUTH_SECRET set
4. Check Vercel logs for startup errors
```

---

## Monitoring & Debugging

### View Workflow Logs

**Via GitHub:**
```
1. Go to Actions tab
2. Select workflow run
3. Click job to expand
4. View step logs
```

**Via GitHub CLI:**
```bash
gh run list --limit 10
gh run view <run-id> --log
```

### View Deployment Logs

**Vercel:**
```bash
vercel logs
```

**GitHub Actions:**
```bash
gh run view <run-id> --log
```

### Common Log Messages

**Success:**
```
✅ All tests passed
✅ Docker image built: ghcr.io/.../splitbill:abc123
✅ Deployed to production
✅ Deployment URL: https://splitbill.vercel.app
```

**Failure:**
```
❌ Test failed: expect(...).toEqual(...)
❌ Docker push failed
❌ Vercel deployment failed
```

---

## Performance Optimization

### Cache Strategy

**NPM Dependencies:**
```
Caches entire node_modules
Cache key: package-lock.json
Hits: ~90% of runs (unless deps change)
Saves: ~2-3 minutes per run
```

**Docker Layers:**
```
GitHub Actions cache (type=gha)
Saves build layers
Reuses from previous builds
Saves: ~5-7 minutes on rebuilds
```

### Database Migrations

**Optimization:**
```
Uses PostgreSQL service in GitHub Actions
Starts in ~10 seconds
Migrations run in parallel
Total test job: 3-5 minutes
```

### Parallel Jobs

**test.yml:**
- Single job (sequential)

**deploy.yml:**
- test: ~3-5 min
- build: ~2-3 min (depends on test)
- deploy: ~2-5 min (depends on test + build)
- Total: ~7-13 minutes (not parallel)

**To parallelize:**
- test and build can run in parallel if needed
- Would require restructuring

---

## Cost Analysis

### GitHub Actions

**Free tier:**
- 2,000 minutes/month (private repos)
- Each run: ~5-10 minutes
- Budget: ~200 runs/month

**Estimate for SplitBill:**
- ~30 PRs/month × 3-5 min = 90-150 min
- ~10 deployments/month × 10 min = 100 min
- **Total: 190-250 min/month (within free tier)**

**Cost if exceeded:** $0.25 per additional minute

### GHCR (GitHub Container Registry)

**Storage:**
- Free: 0.5GB public, 0.5GB private
- Our image: ~500MB-1GB
- May exceed free tier → $0.01-0.10 per month

### Vercel

**Deployment:**
- Free tier: unlimited deployments
- Pro tier: $20/month if needed

---

## Security Considerations

### Secrets Management

**Best Practices:**
- ✅ Never commit secrets to git
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets periodically
- ✅ Restrict access to secrets

**Environment Variables:**
- `VERCEL_TOKEN`: Hidden from logs
- `SENDGRID_API_KEY`: Hidden from logs
- `DATABASE_URL`: Hidden from logs

### Access Control

```
Workflows can only access secrets for:
- Their own repository
- Protected branches (main)
- PRs from trusted sources
```

### Audit Trail

```
All deployments logged in Vercel
All builds logged in GitHub Actions
All secrets access logged (GitHub Enterprise)
```

---

## Advanced Features

### Manual Deployment

**Trigger workflow manually:**
```bash
# Not configured in current setup
# Can be added with: workflow_dispatch
```

### Conditional Deployment

**Deploy only on specific events:**
```yaml
if: github.event.push.ref == 'refs/heads/main'
```

### Slack Notifications

**Add notification step:**
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

**GitHub Actions:**
- Automatic email on failure
- Configurable in repository settings

---

## Future Enhancements

- [ ] Staging environment deployment
- [ ] Performance benchmarking
- [ ] Security scanning (Snyk, Dependabot)
- [ ] Code quality analysis (SonarQube)
- [ ] Load testing before production
- [ ] Canary deployments
- [ ] Blue-green deployment strategy
- [ ] Rollback automation
- [ ] Slack/Teams notifications
- [ ] Database backup before deploy

---

## Reference

### GitHub Actions Syntax
- https://docs.github.com/en/actions

### Vercel Deployment
- https://vercel.com/docs

### Docker Build Push Action
- https://github.com/docker/build-push-action

### Workflow Examples
- https://github.com/actions/starter-workflows

