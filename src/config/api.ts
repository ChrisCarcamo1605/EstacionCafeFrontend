// Configuración de API URL para Docker y desarrollo local
// En el servidor (SSR) usa las URLs internas de Docker
// En el cliente (navegador) usa las URLs públicas

// Detectar si estamos en el servidor o en el cliente
const isServer = typeof window === 'undefined';

// URL del backend - En servidor usa variable de entorno (Docker) o localhost (local)
export const BACKEND_API_URL = isServer 
  ? (import.meta.env.SERVER_BACKEND_API_URL || 'http://localhost:3484/api')
  : (import.meta.env.PUBLIC_BACKEND_API_URL || 'http://localhost:3484/api');

// URL del servicio ML
export const ML_API_URL = isServer
  ? (import.meta.env.SERVER_ML_API_URL || 'http://localhost:8000/api')
  : (import.meta.env.PUBLIC_ML_API_URL || 'http://localhost:8000/api');

// URL del servicio de Email
export const EMAIL_SERVICE_URL = isServer
  ? (import.meta.env.SERVER_EMAIL_SERVICE_URL || 'http://localhost:3004/api/send-report')
  : (import.meta.env.PUBLIC_EMAIL_SERVICE_URL || 'http://localhost:3004/api/send-report');
