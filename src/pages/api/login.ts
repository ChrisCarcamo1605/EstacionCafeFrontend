import type { APIRoute } from "astro";
import { BACKEND_API_URL } from "../../config/api";

export const prerender = false;

// URL de tu API Node.js (ajusta según tu configuración)
const NODE_API_URL = `${BACKEND_API_URL}/users/login`;

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const data = await request.formData();
  const username = data.get("username");
  const password = data.get("password");

  if (!username || !password) {
    return redirect(
      "/login?error=" + encodeURIComponent("FALTAN CREDENCIALES")
    );
  }

  try {
    /*
        const apiResponse = await fetch(NODE_API_URL,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({username,password})
        });
      

        if(apiResponse.ok){
            const result = await apiResponse.json();
            const token = result.data.token;

            if(token){
                cookies.set('auth_token',token,{
                    path:'/',
                    maxAge:60*60*24*7,
                 // httpOnly:true,
                    secure: import.meta.env.PROD,
                    sameSite:'lax'
                });
                return redirect('/home');
            }
        } else {
            const errorText = await apiResponse.text();
            alert(errorText)
            return redirect('/login?error='+encodeURIComponent('CREDENCIALES INCORRECTAS'));
        }
              */
    return redirect("/home");
  } catch (error: any) {
    return redirect("/login?error=" + encodeURIComponent("ERROR DE CONEXION"));
  }

  return redirect(
    "/login?error=" + encodeURIComponent("ERROR DE AUTENTICACION")
  );
};
