FROM oven/bun:1

WORKDIR /usr/src/app

# Copy workspace config
COPY ./package.json ./package.json
COPY ./bun.lock ./bun.lock
COPY ./turbo.json ./turbo.json

# Copy all shared packages (db, auth, etc.)
COPY ./packages ./packages

# Copy the WebSocket server app
COPY ./apps/ws-server ./apps/ws-server

# Install all dependencies
RUN bun install

# Generate Prisma client
RUN bun run db:generate

# Pre-build TypeScript → dist/ so we don't recompile on every container restart
RUN cd apps/ws-server && bun run build

EXPOSE 8080

# Run the pre-built output directly
CMD ["bun", "apps/ws-server/dist/index.js"]
