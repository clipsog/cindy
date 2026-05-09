# Root Dockerfile for platforms that require Docker (Coolify, Fly, etc.)
FROM node:20-alpine

WORKDIR /app

# Server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# App server + static UI (Express serves parent directory)
COPY server/ ./server/
COPY index.html app.js styles.css ./

ENV NODE_ENV=production
WORKDIR /app/server

EXPOSE 8080
CMD ["node", "index.js"]
