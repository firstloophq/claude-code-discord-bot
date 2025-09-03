FROM oven/bun:latest

# Install git for submodule initialization
RUN apt-get update && apt-get install -y git

WORKDIR /app

# Copy everything
COPY . .

# Initialize and update git submodules
RUN git init && \
    git submodule init && \
    git submodule update

# Install dependencies
RUN bun install

# Build the submodule
RUN cd submodules/linear-mcp && bun install && bun run build

# Run the application
CMD ["bun", "run", "src/server.ts"]