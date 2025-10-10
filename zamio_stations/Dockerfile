# Stage 1: Base - Set up shared dependencies
FROM node:16 AS base
WORKDIR /app

# Copy shared package first (from root context)
COPY packages/ui-theme ./packages/ui-theme

# Copy application package files
COPY zamio_stations/package*.json ./zamio_stations/

# Install dependencies
WORKDIR /app/zamio_stations
RUN npm ci --no-audit --no-fund --maxsockets 1

# Stage 2: Development - For local development with hot reload
FROM base AS development
WORKDIR /app/zamio_stations

# Copy application source code
COPY zamio_stations .

# Expose the port the app runs on
EXPOSE 4174

# Command to run the app in development mode
CMD ["npm", "run", "dev"]

# Stage 3: Builder - Build the production bundle
FROM base AS builder
WORKDIR /app/zamio_stations

# Copy application source code
COPY zamio_stations .

# Build the application
RUN npm run build

# Stage 4: Production - Serve the production build
FROM node:16-alpine AS production
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/zamio_stations/dist ./dist
COPY --from=builder /app/zamio_stations/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund

# Expose the port the app runs on
EXPOSE 4174

# Command to serve the production build
CMD ["npm", "run", "preview"]
