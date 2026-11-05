# Multi-stage production build for Nexora Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definitions
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy all source code
COPY . .

# Build client production bundle
RUN npm run build --prefix client

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy root & server dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source code and client dist bundle
COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/src/server.js"]
