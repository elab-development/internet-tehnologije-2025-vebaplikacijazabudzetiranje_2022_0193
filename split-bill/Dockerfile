# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including dev — needed for prisma CLI in builder stage)
RUN npm install --legacy-peer-deps

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client (use local binary to avoid npx downloading prisma@7)
RUN ./node_modules/.bin/prisma generate

# Compile seed.ts → seed.js so the runner can execute it without ts-node
RUN node -e "\
const ts  = require('./node_modules/typescript');\
const fs  = require('fs');\
const src = fs.readFileSync('prisma/seed.ts', 'utf8');\
const out = ts.transpileModule(src, { compilerOptions: {\
  module: ts.ModuleKind.CommonJS,\
  target: ts.ScriptTarget.ES2020,\
  esModuleInterop: true\
} });\
fs.writeFileSync('prisma/seed.js', out.outputText);\
console.log('Compiled seed.ts → seed.js');\
"

# Set environment to production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js application
RUN npm run build

# ============================================
# STAGE 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy entire @prisma scope (client, engines, fetch-engine, debug, etc.) and prisma CLI
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Recreate prisma symlink — COPY resolves symlinks, which moves __dirname to .bin/
# and breaks relative WASM lookups; symlink keeps __dirname in prisma/build/ where WASM lives
RUN node -e "\
const pkg = require('./node_modules/prisma/package.json');\
const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.prisma;\
const fs  = require('fs');\
fs.mkdirSync('./node_modules/.bin', { recursive: true });\
try { fs.unlinkSync('./node_modules/.bin/prisma'); } catch (e) {}\
fs.symlinkSync('../prisma/' + bin, './node_modules/.bin/prisma');\
console.log('Symlink: .bin/prisma → ../prisma/' + bin);\
"

# Copy runtime dependencies needed by seed.js
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Copy entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application (entrypoint runs migrations then starts server)
CMD ["sh", "entrypoint.sh"]
