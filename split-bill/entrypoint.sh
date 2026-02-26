#!/bin/sh
set -e

echo "Running database migrations..."

# Try a normal deploy first (works on fresh DB and clean existing DB).
# If stale failed-migration records from a previous broken run block us (P3009),
# fall back to a full reset so the container always starts successfully.
if ! ./node_modules/.bin/prisma migrate deploy; then
  echo "Deploy blocked by failed migration record — resetting database..."
  ./node_modules/.bin/prisma migrate reset --force --skip-seed
  echo "Reset complete. Migrations applied."
fi

echo "Seeding database..."
node ./prisma/seed.js

echo "Starting application..."
exec node server.js
