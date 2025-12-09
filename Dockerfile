# Dependencies layer (cached until package*.json changes)
FROM node:22-alpine AS deps
RUN echo "📦 Installing dependencies..."
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build Layer
FROM node:22-alpine AS build
RUN echo "🔨 Building webapp..."
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN echo "✅ Build completed."