# MenusQR API. Runs as a single always-on container (SSE order stream, email outbox worker and
# the task queue all live in this one process, so do not scale it to more than one replica).
FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

# Dependencies first so code-only changes reuse the cached layer. sharp ships prebuilt
# binaries for both x64 and arm64 (Oracle Ampere), so no compiler is needed.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# The local storage driver and legacy /uploads files need a writable directory.
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3001

# "/" answers 200 even when a payment key is missing, unlike /api/health which returns 503.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
