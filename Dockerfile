# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Kopírování souborů pro instalaci závislostí
COPY package*.json ./
RUN npm install

# Definice build argumentů pro Vite
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_SIDECAR_URL

# Nastavení environmentálních proměnných pro build proces
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_SIDECAR_URL=$VITE_SIDECAR_URL

# Kopírování zbytku aplikace a build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Kopírování vlastní konfigurace Nginxu
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopírování vybudované aplikace z build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
