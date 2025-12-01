# 🚀 Guía de Despliegue en Vercel

## Paso 1: Configurar Variables de Entorno en Vercel

Antes de desplegar, necesitas agregar todas las variables de entorno en el dashboard de Vercel.

### 📍 Cómo agregar variables de entorno:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings** (Configuración)
3. Click en **Environment Variables** (Variables de Entorno)
4. Agrega cada variable una por una

### 🔑 Variables Requeridas:

#### **Google Gemini AI**
```
GOOGLE_API_KEY=tu_google_api_key_aqui
```

#### **Supabase**
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

#### **Clerk (Autenticación)**
```
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### **Clerk Webhook (Opcional - configurar después)**
```
CLERK_WEBHOOK_SECRET=whsec_...
```

#### **Pinecone (Opcional - solo si tienes RAG configurado)**
```
PINECONE_API_KEY=tu_pinecone_api_key
PINECONE_INDEX_NAME=oaci-docs
```

### ⚙️ Configuración de Environment:

Para cada variable, asegúrate de seleccionar los environments apropiados:
- ✅ **Production**
- ✅ **Preview** (opcional)
- ✅ **Development** (opcional)

## Paso 2: Deploy

Después de configurar las variables:

### Opción A: Deploy desde Git
1. Conecta tu repositorio de GitHub en Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. Click en **Deploy**

### Opción B: Deploy desde CLI
```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Paso 3: Verificar Deployment

1. Espera a que termine el build (2-3 minutos)
2. Vercel te dará una URL de producción
3. Visita la URL y prueba:
   - ✅ Página de inicio carga
   - ✅ Consulta gratuita funciona
   - ✅ Login con Clerk funciona

## Paso 4: Configurar Webhook de Clerk (Post-deployment)

Después del deployment exitoso:

1. Copia la URL de producción (ej: `https://tu-app.vercel.app`)
2. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
3. Webhooks → Add Endpoint
4. URL: `https://tu-app.vercel.app/api/webhooks/clerk`
5. Subscribe to: `user.created`
6. Copia el **Signing Secret**
7. Agrégalo en Vercel como `CLERK_WEBHOOK_SECRET`
8. Redeploy (Vercel lo hará automáticamente)

## 🔧 Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- ✅ Verifica que agregaste la variable en Vercel
- ✅ Asegúrate de seleccionar "Production" environment
- ✅ Redeploy después de agregar variables

### Error: "Build failed"
- ✅ Verifica que todas las variables estén configuradas
- ✅ Revisa los logs en el dashboard de Vercel
- ✅ Compara con `.env.local` (sin incluir los valores secretos)

### Error 401 en /api/chat
- ✅ Verifica que `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` sean correctas
- ✅ Verifica que el dominio de Vercel esté agregado en Clerk Allowed Origins

### Webhook no funciona
- ✅ Verifica que `CLERK_WEBHOOK_SECRET` esté configurado
- ✅ Verifica que la URL del webhook sea correcta
- ✅ Revisa logs en Clerk Dashboard

## 📊 Checklist Final

Antes de marcar como "deployed":

- [ ] Todas las variables de entorno configuradas
- [ ] Build exitoso en Vercel
- [ ] Página principal carga correctamente
- [ ] Login con Clerk funciona
- [ ] Consulta gratuita funciona
- [ ] Webhook de Clerk configurado (opcional)
- [ ] Custom domain configurado (opcional)

## 🎯 Próximos Pasos

1. **Custom Domain**: Configura tu dominio personalizado en Vercel
2. **Analytics**: Habilita Vercel Analytics para métricas
3. **Speed Insights**: Habilita Speed Insights para performance
4. **Monitoring**: Configura alertas para errores

---

✨ **Tu app está lista para producción!**
