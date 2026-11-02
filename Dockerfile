# Install dependencies with the lockfile so local and container installs match.
FROM node:20-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY . .
ENV DATABASE_URL=postgres://postgres:123456@localhost:5432/all_rent
RUN npm run build

# Run the custom Next.js and Socket.IO server.
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=node:node /app ./
USER node

EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/tsx scripts/migrate.ts && ./node_modules/.bin/tsx server.ts"]
