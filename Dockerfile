FROM nginx:stable-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static frontend files to Nginx HTML folder
COPY . /usr/share/nginx/html

# Clean up build/config/source control files from container html folder
RUN rm -rf /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/docker-compose.yml \
           /usr/share/nginx/html/backend-app \
           /usr/share/nginx/html/.git

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
