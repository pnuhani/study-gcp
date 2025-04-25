# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with caching
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Create a non-root user
RUN adduser -D -g '' nginxuser

# Copy nginx configuration and set permissions
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d && \
    chmod -R 755 /etc/nginx/conf.d && \
    mkdir -p /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx && \
    mkdir -p /var/run && \
    chown -R nginxuser:nginxuser /var/run && \
    chmod -R 755 /var/run && \
    touch /run/nginx.pid && \
    chown nginxuser:nginxuser /run/nginx.pid && \
    chmod 644 /run/nginx.pid

# Add security headers
RUN echo "server_tokens off;" > /etc/nginx/conf.d/security.conf

# Switch to non-root user
USER nginxuser

# Expose port 80
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]