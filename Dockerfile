# -------------------------------------------------------------------
# STAGE 1: Build the TypeScript code
# -------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files first (leverages Docker cache)
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies like typescript)
RUN npm ci

# Copy the rest of the application source code
COPY src ./src

# Compile TypeScript to JavaScript (generates the /dist folder)
RUN npm run build

# -------------------------------------------------------------------
# STAGE 2: Production runtime
# -------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 5000 (the port your server listens on)
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]