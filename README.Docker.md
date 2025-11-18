# 🐳 Dockerización de Estación Café Frontend

Este proyecto incluye configuraciones Docker para facilitar el despliegue tanto del frontend Astro como del servidor de emails y alertas.

## 📋 Estructura de Contenedores

- **astro-frontend**: Aplicación frontend construida con Astro
- **email-server**: Servidor Node.js para envío de emails y alertas de inventario

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail
EMAIL_PORT=3003
ALERT_EMAIL=admin@estacioncafe.com
ALERT_THRESHOLD_PERCENTAGE=25
ALERT_CHECK_INTERVAL_HOURS=24
BACKEND_API_URL=http://localhost:3484/api
```

### 2. Construir y Ejecutar con Docker Compose

```bash
# Construir las imágenes
docker-compose build

# Iniciar los contenedores
docker-compose up -d

# Ver los logs
docker-compose logs -f
```

### 3. Acceder a los Servicios

- **Frontend**: http://localhost:4321
- **Email Server**: http://localhost:3003
- **Health Check**: http://localhost:3003/api/health

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Detener los contenedores
docker-compose stop

# Iniciar contenedores detenidos
docker-compose start

# Reiniciar contenedores
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Eliminar contenedores y volúmenes
docker-compose down -v
```

### Ver Logs

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f astro-frontend
docker-compose logs -f email-server
```

### Construir Imágenes

```bash
# Reconstruir todas las imágenes
docker-compose build --no-cache

# Reconstruir una imagen específica
docker-compose build --no-cache astro-frontend
docker-compose build --no-cache email-server
```

## 🏗️ Uso en Otro Proyecto

Si quieres usar estos contenedores desde otro proyecto, tienes varias opciones:

### Opción 1: Usar Docker Compose Externo

Crea un `docker-compose.yml` en tu proyecto que referencie estos servicios:

```yaml
version: '3.8'

services:
  estacion-cafe-frontend:
    image: estacion-cafe-frontend:latest
    ports:
      - "4321:4321"
    networks:
      - mi-red

  estacion-cafe-email:
    image: estacion-cafe-email-server:latest
    ports:
      - "3003:3003"
    environment:
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
    networks:
      - mi-red

networks:
  mi-red:
    external: true
```

### Opción 2: Construir desde GitHub

Si subes el proyecto a GitHub:

```yaml
services:
  frontend:
    build:
      context: https://github.com/tu-usuario/EstacionCafeFrontend.git
      dockerfile: Dockerfile
```

### Opción 3: Publicar en Docker Hub

```bash
# Etiquetar las imágenes
docker tag estacion-cafe-frontend:latest tu-usuario/estacion-cafe-frontend:latest
docker tag estacion-cafe-email-server:latest tu-usuario/estacion-cafe-email-server:latest

# Publicar en Docker Hub
docker push tu-usuario/estacion-cafe-frontend:latest
docker push tu-usuario/estacion-cafe-email-server:latest
```

Luego usar en otro proyecto:

```yaml
services:
  frontend:
    image: tu-usuario/estacion-cafe-frontend:latest
    ports:
      - "4321:4321"
```

## 📦 Estructura de Archivos Docker

```
EstacionCafeFrontend/
├── Dockerfile                 # Dockerfile del frontend Astro
├── .dockerignore             # Archivos a ignorar en el build de Astro
├── docker-compose.yml        # Orquestación de servicios
├── .env.example             # Ejemplo de variables de entorno
└── server/
    ├── Dockerfile           # Dockerfile del servidor de emails
    └── .dockerignore       # Archivos a ignorar en el build del servidor
```

## 🔧 Personalización

### Cambiar Puertos

Edita el `docker-compose.yml`:

```yaml
ports:
  - "TU_PUERTO:4321"  # Para frontend
  - "TU_PUERTO:3003"  # Para email server
```

### Añadir Volúmenes Persistentes

Para persistir datos:

```yaml
volumes:
  - ./data:/app/data
```

### Configurar Red Externa

Si necesitas conectar con otros contenedores:

```yaml
networks:
  default:
    external:
      name: mi-red-existente
```

## 🐛 Solución de Problemas

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Verificar el estado
docker-compose ps
```

### Error de permisos

```bash
# Limpiar volúmenes
docker-compose down -v

# Reconstruir
docker-compose up --build
```

### Problemas de red

```bash
# Verificar redes
docker network ls

# Recrear red
docker network rm estacion-cafe-network
docker-compose up
```

## 📊 Monitoreo

### Health Checks

Los servicios incluyen health checks automáticos:

```bash
# Ver estado de salud
docker ps
```

### Estadísticas de Recursos

```bash
# Ver uso de CPU y memoria
docker stats
```

## 🔒 Consideraciones de Seguridad

- ✅ Los contenedores corren con usuarios no-root
- ✅ Las variables sensibles se pasan por variables de entorno
- ✅ Se incluyen health checks para monitoreo
- ⚠️ **Importante**: Nunca subas el archivo `.env` a Git
- ⚠️ Usa secrets en producción (Docker Swarm, Kubernetes)

## 📝 Notas Adicionales

- El frontend requiere que Astro esté configurado con el adaptador de Node.js
- El email server necesita credenciales válidas de Gmail con App Passwords habilitado
- Los contenedores están optimizados para producción con builds multi-stage
- Se incluyen `.dockerignore` para reducir el tamaño de las imágenes

## 🤝 Contribución

Si encuentras algún problema o mejora en la configuración Docker, no dudes en reportarlo.

---

**Desarrollado con ❤️ para Estación Café**
