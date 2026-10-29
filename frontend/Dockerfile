# Stage 1: Build the React + Vite frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching ke liye)
COPY package*.json ./
RUN npm install

# Copy source code and build production assets (dist/ banayega)
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx (~25MB)
FROM nginx:alpine

# Builder stage se sirf compiled dist folder copy karo
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration copy karo (React SPA routing ke liye)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx default HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
