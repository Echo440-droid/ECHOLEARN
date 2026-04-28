# ─── Build Stage ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for tsc)
RUN npm ci

# Copy prisma schema (needed for prisma generate)
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# ─── Production Stage ────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy prisma schema and generate client for production
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist/

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
