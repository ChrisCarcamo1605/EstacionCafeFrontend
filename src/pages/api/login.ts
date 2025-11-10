import type { APIRoute } from "astro";

export const prerender = false;

const NODE_API_URL = 'http://localhost:3484/api/users/login';

export const POST: APIRoute = async ({request,redirect,cookies})=>{
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if(!username || !password){
        return redirect('/login?error='+encodeURIComponent('FALTAN CREDENCIALES'));
    }

    try{
        // console.log('Haciendo fetch a:', NODE_API_URL);
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
                    httpOnly:true,
                    secure: import.meta.env.PROD,
                    sameSite:'lax'
                });
                return redirect('/home');
            }
        } else {
            const errorText = await apiResponse.text();
            return redirect('/login?error='+encodeURIComponent('CREDENCIALES INCORRECTAS'));
        }
    }catch(error:any){
        return redirect('/login?error='+encodeURIComponent('ERROR DE CONEXION'));
    }
    
    return redirect('/login?error='+encodeURIComponent('ERROR DE AUTENTICACION'));
}