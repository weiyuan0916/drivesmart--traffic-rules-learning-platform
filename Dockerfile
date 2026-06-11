# ============================================================
# Dockerfile — Listening API Server
# ============================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# Install production deps only (no native modules needed)
RUN npm ci --omit=dev --ignore-scripts

COPY server/ ./server/
COPY tsconfig.json ./

RUN npx tsc server/listening_server.ts \
  --outDir server/dist \
  --module ESNext \
  --moduleResolution node \
  --target ES2020 \
  --esModuleInterop true \
  --skipLibCheck

# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV LISTENING_PORT=3002

COPY --from=builder /app/server/dist ./dist

EXPOSE ${PORT:-3002}

CMD ["node", "dist/listening_server.js"]
