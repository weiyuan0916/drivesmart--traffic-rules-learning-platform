# ============================================================
# Dockerfile — Listening API Server
# ============================================================

FROM node:26-alpine AS builder

WORKDIR /app

# Copy only files needed for server build
COPY package.json package-lock.json* ./
COPY server/ ./server/
COPY tsconfig.server.json ./

# Install production deps
RUN npm ci --omit=dev --ignore-scripts

# Install TypeScript globally (needed to compile, but not in prod deps)
RUN npm install -g typescript tsx

# Build TypeScript server
RUN tsc server/listening_server.ts \
  --outDir server/dist \
  --module ESNext \
  --moduleResolution node \
  --target ES2020 \
  --esModuleInterop true \
  --skipLibCheck \
  --types node

# ============================================================
FROM node:26-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy compiled server only
COPY --from=builder /app/server/dist ./dist

EXPOSE ${PORT:-3002}

CMD ["node", "dist/listening_server.js"]
