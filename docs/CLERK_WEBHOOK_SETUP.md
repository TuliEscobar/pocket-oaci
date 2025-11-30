# 🔗 Configuración del Webhook de Clerk

Para que los usuarios se sincronicen automáticamente con Supabase al registrarse, necesitas configurar un webhook en Clerk.

## Pasos:

1. **Ve al Dashboard de Clerk**: [https://dashboard.clerk.com](https://dashboard.clerk.com)

2. **Selecciona tu aplicación** (la que tiene la key `pk_test_ZWxlY3RyaWMtY293LTE4...`)

3. **Ve a "Webhooks"** en el menú lateral

4. **Crea un nuevo Endpoint**:
   - **Endpoint URL**: `https://TU_DOMINIO_VERCEL/api/webhooks/clerk`
     - Si estás en desarrollo local: `http://localhost:3000/api/webhooks/clerk`
     - En producción: `https://oaci.ai/api/webhooks/clerk`
   
5. **Selecciona el evento**: `user.created`

6. **Guarda** y copia el **Signing Secret** (empieza con `whsec_...`)

7. **Agrega el secret a `.env.local`**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_tu_secret_aqui
   ```

8. **Reinicia el servidor** (`Ctrl+C` -> `npm run dev`)

## Verificación

Una vez configurado, cuando un nuevo usuario se registre:
- ✅ Se creará en Clerk
- ✅ Se creará automáticamente en Supabase (tabla `users`)
- ✅ Podrás ver el log en la consola: `✅ User email@example.com synced to Supabase`

## Nota para Desarrollo Local

Si estás probando en `localhost`, necesitas exponer tu servidor local a internet temporalmente usando **ngrok** o **Cloudflare Tunnel** para que Clerk pueda enviar el webhook.

Para producción, esto funcionará automáticamente una vez desplegado en Vercel.
