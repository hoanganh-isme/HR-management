FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies with the Node.js package manager.
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8081

# Run the server
CMD ["npm", "run", "start"]
