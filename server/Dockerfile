# Dockerfile para Email Server
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY server.js ./
COPY .env* ./

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 emailserver && \
    chown -R emailserver:nodejs /app

# Cambiar al usuario no-root
USER emailserver

# Exponer puerto
EXPOSE 3004

# Variable de entorno por defecto
ENV NODE_ENV=production
ENV EMAIL_PORT=3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar el servidor
CMD ["node", "server.js"]
