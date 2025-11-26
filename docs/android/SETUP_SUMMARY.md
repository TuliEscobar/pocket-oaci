# 📱 Resumen de Configuracion Android - OACI.ai

## ✅ Lo que hemos completado

### 1. **Instalacion de Capacitor**
- ✅ `@capacitor/core` v7.4.4
- ✅ `@capacitor/cli` v7.4.4
- ✅ `@capacitor/android` v7.4.4

### 2. **Configuracion del Proyecto**
- ✅ `capacitor.config.ts` configurado
- ✅ Plataforma Android agregada
- ✅ Proyecto sincronizado

### 3. **Configuracion de Next.js**
- ✅ `next.config.ts` actualizado para exportacion estatica
- ✅ Imagenes sin optimizacion (requerido para Capacitor)
- ✅ Trailing slashes habilitados

### 4. **Configuracion de Android**
- ✅ AndroidManifest.xml configurado
- ✅ Permisos de internet agregados
- ✅ Soporte para HTTP/HTTPS (desarrollo y produccion)
- ✅ Network security config creado

### 5. **Scripts NPM**
- ✅ `npm run android:sync` - Sincronizar cambios
- ✅ `npm run android:open` - Abrir en Android Studio

### 6. **Documentacion**
- ✅ `ANDROID_QUICKSTART.md` - Guia rapida
- ✅ `docs/ANDROID_BUILD_GUIDE.md` - Guia completa
- ✅ `.gitignore` actualizado para Android

## 🎯 Arquitectura de la App

```
┌─────────────────────────────────────┐
│   App Android (WebView)             │
│   - UI renderizada localmente       │
│   - Clerk Auth (funciona normal)    │
└─────────────┬───────────────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│   Servidor Vercel                   │
│   https://oaci-ai.vercel.app        │
│   - API Routes (/api/chat)          │
│   - Gemini AI                       │
│   - Pinecone RAG                    │
└─────────────────────────────────────┘
```

## 📋 Configuracion Actual

### Modo: **PRODUCCION**
- URL: `https://oaci-ai.vercel.app`
- Cleartext: `false` (HTTPS)
- Requiere: Conexion a internet

### Para cambiar a Modo Desarrollo:
Edita `capacitor.config.ts`:
```typescript
server: {
  url: 'http://10.0.2.2:3000',  // localhost en emulador
  cleartext: true
}
```

## 🚀 Proximos Pasos

### Paso 1: Instalar Android Studio
1. Descarga: https://developer.android.com/studio
2. Instala con SDK, Platform Tools y AVD
3. Configura ANDROID_HOME en variables de entorno

### Paso 2: Abrir el Proyecto
```bash
npm run android:open
```

### Paso 3: Crear Emulador
- Tools > Device Manager
- Create Device > Pixel 6
- System Image: Android 13 (API 33)

### Paso 4: Ejecutar
- Presiona ▶️ Run
- Espera a que compile
- La app se abrira en el emulador

### Paso 5: Probar
- Inicia sesion con Clerk
- Haz una consulta
- Verifica que funcione correctamente

## 🔧 Comandos Utiles

```bash
# Sincronizar cambios web con Android
npm run android:sync

# Abrir en Android Studio
npm run android:open

# Generar APK de debug
cd android
.\gradlew assembleDebug

# Limpiar build
cd android
.\gradlew clean
```

## 📦 Generar APK para Distribucion

### APK de Debug (testing)
```bash
cd android
.\gradlew assembleDebug
```
Ubicacion: `android\app\build\outputs\apk\debug\app-debug.apk`

### APK de Release (produccion)
1. Crear keystore (solo una vez)
2. Configurar signing en `build.gradle`
3. Ejecutar:
```bash
cd android
.\gradlew assembleRelease
```

## 🎨 Personalizacion Pendiente

### Icono de la App
- Crear icono 1024x1024px
- Usar Android Asset Studio
- Reemplazar en `android/app/src/main/res/mipmap-*/`

### Splash Screen
- Disenar splash screen
- Configurar en `styles.xml`

### Colores y Tema
- Editar `android/app/src/main/res/values/colors.xml`
- Ajustar tema en `styles.xml`

## ⚠️ Consideraciones Importantes

### Clerk Authentication
- Funciona normalmente en la app
- Asegurate de agregar `capacitor://localhost` en Clerk Dashboard
- Las cookies y sesiones funcionan correctamente

### API Calls
- Todas las llamadas van a Vercel
- No expongas API keys en el cliente
- El backend maneja toda la logica sensible

### Actualizaciones
- Cambios en el frontend web: Solo actualiza en Vercel
- Cambios en la app nativa: Requiere nueva version en Play Store
- La mayoria de cambios seran solo en Vercel (mas rapido)

## 📱 Publicar en Play Store (Futuro)

1. Crear cuenta de desarrollador ($25 USD una vez)
2. Generar App Bundle (AAB):
   ```bash
   cd android
   .\gradlew bundleRelease
   ```
3. Subir a Play Console
4. Completar listado de la tienda
5. Enviar para revision

## 🐛 Troubleshooting

### Error: SDK not found
Crea `android\local.properties`:
```
sdk.dir=C:\\Users\\tulie\\AppData\\Local\\Android\\Sdk
```

### App no carga
1. Verifica que Vercel este funcionando
2. Revisa logs en Android Studio (Logcat)
3. Inspecciona WebView: `chrome://inspect`

### Gradle sync failed
1. File > Invalidate Caches > Invalidate and Restart
2. Limpia: `.\gradlew clean`
3. Reconstruye: Build > Rebuild Project

## 📚 Recursos

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Clerk Mobile Apps](https://clerk.com/docs/deployments/mobile)
- [Play Store Publishing](https://developer.android.com/studio/publish)

## ✨ Estado del Proyecto

- **Java**: ✅ JDK 17 instalado
- **Capacitor**: ✅ Configurado
- **Android Project**: ✅ Creado y sincronizado
- **Network Config**: ✅ HTTP/HTTPS soportado
- **Scripts**: ✅ Listos para usar
- **Documentacion**: ✅ Completa

**Siguiente paso**: Instalar Android Studio y ejecutar la app!

---
Configurado: 2025-11-26
Version: 1.0.0
