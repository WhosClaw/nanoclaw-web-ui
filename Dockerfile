# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest files first for layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for tsc)
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Prune devDependencies so we can copy a clean node_modules
RUN npm prune --omit=dev

# ── Stage 2: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy compiled output and static files
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --chown=appuser:appgroup public/ ./public/

# Copy package.json (required by Node ESM loader for "type": "module")
COPY --chown=appuser:appgroup package.json ./

USER appuser

EXPOSE 3000

# Health check using the /api/health endpoint
# Uses wget (available in Alpine by default; curl is not)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

ENV WEB_UI_HOST=0.0.0.0 \
    WEB_UI_PORT=3000 \
    STATIC_PATH=/app/public \
    NODE_ENV=production

CMD ["node", "dist/index.js"]
