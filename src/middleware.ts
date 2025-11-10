import { defineMiddleware } from "astro:middleware";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'AdministracionBaseDatos!@2025';

const PUBLIC_ROUTES = ['/','/login','/api/login'];
const PROTECTED_PREFIXES = [];

export const onRequest = defineMiddleware(async (context:any,next:any)=> {
    const {pathname} = context.url;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if(isPublicRoute){
        return next();
    }else{
        const token = context.cookies.get('auth_token')?.value;

        if(!token){
            return context.redirect('/login');
        }
        
        try{
            const payload = jwt.verify(token, JWT_SECRET);
            context.locals.user = payload;
        }catch(error:any){
            console.error('Error de validacion JWT:', error);
            console.error('Token recibido:', token);

            return context.redirect('/login');
        }
    }

    return next();
})