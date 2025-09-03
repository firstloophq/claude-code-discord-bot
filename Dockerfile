FROM oven/bun:latest

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Build the submodule
RUN cd submodules/linear-mcp && bun install && bun run build

# Run the application
CMD ["bun", "run", "src/server.ts"]