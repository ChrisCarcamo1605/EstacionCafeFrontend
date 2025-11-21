# ☕ Estación Café - Sistema de Gestión

Sistema completo de gestión para cafetería con frontend (Astro), backend (Node.js), ML Dashboard y servicio de correos.

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**URLs:**
- Frontend: http://localhost:4321
- Backend API: http://localhost:3484
- ML Dashboard: http://localhost:8000
- Email Service: http://localhost:3004

### Opción 2: Desarrollo Local

```bash
# Frontend
npm install
npm run dev

# Backend (en otra terminal)
cd projects/EstacionCafe
npm install
npm start

# Email Server (en otra terminal)
cd server
npm install
node server.js
```

## 📦 Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend (Astro) | 4321 | Interfaz web principal |
| Backend (Node.js) | 3484 | API REST con TypeORM |
| PostgreSQL | 5555 | Base de datos |
| ML Dashboard | 8000 | Análisis y predicciones |
| Email Service | 3004 | Envío de reportes y alertas |

## 🔧 Configuración

### Variables de Entorno

**Docker**: Usa `.env.docker`
```bash
SERVER_BACKEND_API_URL=http://backend:3484/api
PUBLIC_BACKEND_API_URL=http://localhost:3484/api
```

**Local**: Los valores por defecto usan `localhost`

### Base de Datos

Credenciales por defecto (Docker):
- Host: localhost:5555
- Database: estacioncafedb
- User: admin
- Password: estacionPass2025

## 📧 Servicio de Email

Configurar en `server/.env.docker`:
```bash
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
ALERT_EMAIL=destinatario@email.com
```

## 🛠️ Comandos Útiles

```bash
# Docker
docker-compose up -d --build     # Reconstruir y levantar
docker-compose restart frontend  # Reiniciar servicio específico
docker logs -f <container>       # Ver logs en tiempo real

# Local
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build
```

## 📊 Funcionalidades

- ✅ Gestión de ventas y facturas
- ✅ Control de inventario (consumibles, productos, ingredientes)
- ✅ Administración de mesas
- ✅ Reportes automatizados por email
- ✅ Alertas de stock bajo
- ✅ Dashboard de estadísticas
- ✅ Predicciones con ML

## 🐛 Solución de Problemas

**Error "fetch failed" en Docker:**
- Verifica que los contenedores estén corriendo: `docker ps`
- Revisa logs: `docker logs <container-name>`

**Error al enviar correos:**
- Configura correctamente `EMAIL_USER` y `EMAIL_PASS` en `server/.env.docker`
- Usa una App Password de Gmail

**Puerto en uso:**
```bash
# Windows
netstat -ano | findstr :4321
taskkill /PID <PID> /F
```

## 📝 Estructura del Proyecto

```
EstacionCafeFrontend/
├── src/                    # Frontend Astro
├── projects/EstacionCafe/  # Backend Node.js
├── server/                 # Email Service
├── projects/machinelearningcafeteria/  # ML Dashboard
└── docker-compose.yml      # Configuración Docker
```

## 👨‍💻 Desarrollo

**Tech Stack:**
- Frontend: Astro, TypeScript, Bootstrap
- Backend: Node.js, TypeORM, PostgreSQL
- ML: Python, FastAPI
- Emails: Nodemailer

---

**Desarrollado por:** ChrisCarcamo1605  
**Año:** 2025
