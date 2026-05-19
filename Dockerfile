# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set environment variables for production build
ARG VITE_APPWRITE_ENDPOINT=https://appwrite.propoj.app/v1
ARG VITE_APPWRITE_PROJECT_ID=69effdf6003ce697ee83

ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID

# Build the production bundle
RUN npm run build

# Stage 2: Production runtime stage
FROM nginx:1.25-alpine

# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
