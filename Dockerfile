# Dockerfile para Astro Frontend
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
FROM base AS deps
RUN npm ci

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build de la aplicación Astro
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copiar archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar al usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=4321

# Comando para iniciar la aplicación
CMD ["node", "./dist/server/entry.mjs"]
