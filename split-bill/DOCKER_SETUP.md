# Docker Setup Guide

## Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose v2.0+

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd split-bill
```

### 2. Create `.env` file

```bash
cp .env.example .env
```

Important: Update the following variables in `.env`:

- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `SENDGRID_API_KEY` - Your SendGrid API key
- `EMAIL_FROM` - Your verified sender email

### 3. Start services

```bash
docker-compose up -d
```

This will start:

- PostgreSQL on port 5432
- Next.js app on port 3000
- Adminer (DB UI) on port 8080

### 4. Check logs

```bash
docker-compose logs -f app
```

### 5. Access the application

- App: http://localhost:3000
- Adminer: http://localhost:8080
  - System: PostgreSQL
  - Server: db
  - Username: splitbill
  - Password: splitbill_password
  - Database: splitbill

## Common Commands

### View logs

```bash
# All services
docker-compose logs -f

# Only app
docker-compose logs -f app

# Only database
docker-compose logs -f db
```

### Restart services

```bash
# Restart all
docker-compose restart

# Restart only app
docker-compose restart app
```

### Stop services

```bash
docker-compose down
```

### Stop and remove volumes (deletes database)

```bash
docker-compose down -v
```

### Rebuild app after code changes

```bash
docker-compose up -d --build app
```

## Database Management

### Run migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

### Seed database

```bash
docker-compose exec app npx prisma db seed
```

### Open Prisma Studio

```bash
docker-compose exec app npx prisma studio
```

## Troubleshooting

### Port already in use

If port 3000 is already in use, change it in `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - '3001:3000'  # Change 3001 to any available port
```

### Database connection issues

Check if PostgreSQL is running:

```bash
docker-compose ps
```

Check database logs:

```bash
docker-compose logs db
```

Restart database:

```bash
docker-compose restart db
```

### App not starting

Check app logs:

```bash
docker-compose logs app
```

Rebuild app:

```bash
docker-compose up -d --build app
```

### Clean slate (removes all data)

```bash
docker-compose down -v
docker system prune -af
docker-compose up -d
```

## Production Deployment

### Build production image

```bash
docker build -t splitbill:production .
```

### Run with production env

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  splitbill:production
```

## Health Check

Check if app is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected"
}
```
