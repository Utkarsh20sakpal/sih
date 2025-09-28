# Multi-stage Dockerfile that builds the React client and runs the Express server

# --- Build stage: install deps and build client ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy root files to ensure correct paths
COPY server ./server
COPY client ./client

# Install client deps and build
WORKDIR /app/client
RUN npm ci && npm run build

# Install server deps
WORKDIR /app/server
RUN npm ci

# --- Runtime stage: lightweight image serving built client via Express ---
FROM node:18-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/server

# Copy server and built client
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client/build /app/client/build

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]