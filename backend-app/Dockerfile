FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies using Bun
RUN bun install

# Copy application code
COPY . .

# Expose port
EXPOSE 8081

# Run the server
CMD ["bun", "run", "server.js"]
