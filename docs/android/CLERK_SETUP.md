# 🔐 Configurar Clerk para Android App

## ⚠️ IMPORTANTE: Configuracion Requerida

Para que la autenticacion de Clerk funcione correctamente en tu app Android, debes agregar dominios adicionales en el Clerk Dashboard.

## 📋 Pasos de Configuracion

### 1. Acceder al Clerk Dashboard

1. Ve a: https://dashboard.clerk.com
2. Selecciona tu aplicacion "OACI.ai"
3. Ve a: **Configure** → **Domains**

### 2. Agregar Dominios Permitidos

Agrega los siguientes dominios a la lista de dominios permitidos:

```
capacitor://localhost
http://localhost
https://oaci-ai.vercel.app
```

**Explicacion:**
- `capacitor://localhost` - Esquema usado por Capacitor en apps nativas
- `http://localhost` - Para desarrollo local
- `https://oaci-ai.vercel.app` - Tu dominio de produccion (ya deberia estar)

### 3. Configurar Redirect URLs

En **Configure** → **Paths**:

Asegurate de que estas URLs esten permitidas:
```
Sign-in redirect: /
Sign-up redirect: /
After sign-out: /
```

### 4. Habilitar OAuth Providers (si usas Google Sign-In)

Si estas usando Google Sign-In:

1. Ve a **Configure** → **SSO Connections** → **Google**
2. Asegurate de que este habilitado
3. Verifica que las credenciales de OAuth esten configuradas

### 5. Configurar Mobile App Settings

En **Configure** → **Sessions**:

- **Session lifetime**: 7 days (recomendado para mobile)
- **Require multi-factor authentication**: Opcional
- **Allow concurrent sessions**: Habilitado

## 🔧 Configuracion Adicional en el Codigo

### Verificar middleware.ts

Tu archivo `middleware.ts` ya esta configurado correctamente:

```typescript
const isProtectedRoute = createRouteMatcher(['/api/chat(.*)']);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
    // ...
});
```

Esto protege las rutas API pero permite acceso publico a las paginas.

### Verificar layout.tsx

Asegurate de que `ClerkProvider` este configurado correctamente:

```typescript
<ClerkProvider
  localization={locale === 'es' ? esES : undefined}
  appearance={{
    // ... tu configuracion actual
  }}
>
  {children}
</ClerkProvider>
```

## 🧪 Probar la Autenticacion

### En el Emulador Android

1. Ejecuta la app en el emulador
2. Haz clic en "Sign In" o "Registrarme"
3. El modal de Clerk deberia aparecer
4. Inicia sesion con Google o email
5. Deberias ser redirigido de vuelta a la app

### Debugging

Si la autenticacion no funciona:

1. **Abre Chrome DevTools**:
   - En Chrome, ve a: `chrome://inspect`
   - Busca tu dispositivo/emulador
   - Haz clic en "inspect"

2. **Revisa la consola** para errores como:
   - `Invalid redirect URL`
   - `Domain not allowed`
   - `CORS errors`

3. **Verifica los logs de Android**:
   - En Android Studio: View → Tool Windows → Logcat
   - Filtra por: `Chromium` o `WebView`

## 🔒 Seguridad

### Variables de Entorno

Asegurate de que estas variables esten configuradas en Vercel:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**NUNCA** incluyas estas keys en el codigo de la app Android.

### Cookies y Sesiones

Clerk usa cookies para mantener la sesion. En Android:

- Las cookies funcionan normalmente en WebView
- La sesion persiste entre reinicios de la app
- El usuario no necesita iniciar sesion cada vez

### HTTPS en Produccion

En produccion, asegurate de:
- Usar solo HTTPS (no HTTP)
- Tener certificado SSL valido en Vercel
- Configurar `cleartext: false` en `capacitor.config.ts`

## 🐛 Troubleshooting

### Error: "Invalid redirect URL"

**Solucion**: Verifica que `capacitor://localhost` este en la lista de dominios permitidos en Clerk.

### Error: "Domain not allowed"

**Solucion**: Agrega todos los dominios necesarios en Clerk Dashboard → Configure → Domains.

### El modal de Clerk no aparece

**Solucion**: 
1. Verifica que `@clerk/nextjs` este instalado
2. Revisa la consola del navegador (chrome://inspect)
3. Asegurate de que no haya errores de CORS

### La sesion no persiste

**Solucion**:
1. Verifica que las cookies esten habilitadas en WebView
2. Aumenta el "Session lifetime" en Clerk Dashboard
3. Revisa que no haya errores en Logcat

### Google Sign-In no funciona

**Solucion**:
1. Verifica que Google OAuth este configurado en Clerk
2. Asegurate de tener las credenciales correctas
3. Agrega el SHA-1 de tu keystore en Google Cloud Console (para produccion)

## 📱 Consideraciones para Produccion

### Antes de publicar en Play Store:

1. **Generar Keystore de Release**:
   ```bash
   keytool -genkey -v -keystore oaci-release-key.keystore -alias oaci -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Obtener SHA-1 del Keystore**:
   ```bash
   keytool -list -v -keystore oaci-release-key.keystore -alias oaci
   ```

3. **Agregar SHA-1 a Google Cloud Console**:
   - Ve a: https://console.cloud.google.com
   - Selecciona tu proyecto
   - APIs & Services → Credentials
   - Edita tu OAuth 2.0 Client ID
   - Agrega el SHA-1 en "SHA-1 certificate fingerprints"

4. **Actualizar Clerk con el nuevo dominio**:
   - Si cambias el `appId` en `capacitor.config.ts`
   - Agrega el nuevo esquema en Clerk Dashboard

## ✅ Checklist de Configuracion

Antes de probar la app, verifica:

- [ ] Dominios agregados en Clerk Dashboard
- [ ] Redirect URLs configuradas
- [ ] Google OAuth habilitado (si lo usas)
- [ ] Session lifetime configurado
- [ ] Variables de entorno en Vercel
- [ ] `capacitor.config.ts` apunta a Vercel
- [ ] Network security config permite HTTPS

## 📚 Recursos Adicionales

- [Clerk Mobile Apps Guide](https://clerk.com/docs/deployments/mobile)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Android WebView Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/)

---

**Nota**: La configuracion actual ya esta lista para funcionar. Solo necesitas agregar los dominios en Clerk Dashboard y probar!
