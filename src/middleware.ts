import { defineMiddleware } from "astro:middleware";
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'AdministracionBaseDatos!@2025';
const PUBLIC_ROUTES = ['/', '/login', '/api/login'];

const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/administracion': ['admin','cajero'],
    '/administracion/inventario': ['mesero'],
    '/administracion/estadisticas': ['admin'],
    '/administracion/ajustes': ['admin'],
    '/administracion/planilla': ['admin'],
    
    '/realizar-pedido': ['admin', 'mesero', 'cajero'],
};

function hasAccess(pathname: string, userRole: string): boolean {
    // Buscar la ruta que coincida
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
            return allowedRoles.includes(userRole);
        }
    }
    return true;
}

export const onRequest = defineMiddleware(async (context:any,next:any)=> {
    const {pathname} = context.url;

    // Permitir rutas públicas
    if(PUBLIC_ROUTES.includes(pathname)){
        return next();
    }

    // Verificar token
    const token = context.cookies.get('auth_token')?.value;
    if(!token){
        return context.redirect('/login');
    }
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) as any;
        context.locals.user = payload;
        
        // Verificar permisos
        const userRole = payload.role || 'guest';
        
        if(!hasAccess(pathname, userRole)){
            return context.redirect('/home');
        }
        
    }catch(error:any){
        return context.redirect('/login');
    }

    return next();
})