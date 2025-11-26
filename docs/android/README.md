# 📱 Documentación Android - OACI.ai

Esta carpeta contiene toda la documentación relacionada con la aplicación Android de OACI.ai.

## 📚 Índice de Documentación

### 🚀 Para Empezar

1. **[QUICKSTART.md](./QUICKSTART.md)** - Guía rápida de inicio
   - Configuración inicial
   - Próximos pasos
   - Comandos básicos

2. **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - Resumen completo de la configuración
   - Lo que se ha configurado
   - Arquitectura de la app
   - Estado del proyecto

### 📖 Guías Detalladas

3. **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** - Guía completa de build y publicación
   - Prerrequisitos (JDK, Android Studio)
   - Proceso de build completo
   - Generar APK/AAB
   - Publicar en Play Store
   - Troubleshooting detallado

4. **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Configuración de autenticación Clerk
   - Configurar Clerk Dashboard
   - Dominios permitidos
   - OAuth y Google Sign-In
   - Debugging de autenticación

### 🛠️ Herramientas

5. **[android-check.ps1](./android-check.ps1)** - Script de verificación
   - Verifica Java JDK
   - Verifica Android SDK
   - Valida estructura del proyecto

## 🎯 Flujo de Trabajo Recomendado

### Primera Vez

1. Lee **QUICKSTART.md** para entender los pasos básicos
2. Revisa **SETUP_SUMMARY.md** para ver qué está configurado
3. Sigue **BUILD_GUIDE.md** para instalar Android Studio
4. Configura Clerk siguiendo **CLERK_SETUP.md**

### Desarrollo Diario

1. Haz cambios en tu código Next.js
2. Ejecuta `npm run android:sync` si hay cambios en el frontend
3. Prueba en el emulador con Android Studio

### Antes de Publicar

1. Revisa **BUILD_GUIDE.md** sección "Generar APK para Distribución"
2. Verifica **CLERK_SETUP.md** sección "Consideraciones para Producción"
3. Genera el App Bundle (AAB)
4. Sube a Play Store

## 🏗️ Arquitectura de la App

```
┌─────────────────────────────────────┐
│   App Android (Capacitor WebView)  │
│   - UI renderizada localmente       │
│   - Clerk Auth integrado            │
│   - Experiencia nativa              │
└─────────────┬───────────────────────┘
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│   Servidor Next.js (Vercel)         │
│   https://oaci-ai.vercel.app        │
│   - API Routes (/api/chat)          │
│   - Gemini AI                       │
│   - Pinecone RAG                    │
│   - Clerk Backend                   │
└─────────────────────────────────────┘
```

**Tipo**: App Híbrida (WebView + Servidor Remoto)

**Ventajas**:
- ✅ Backend compartido con la web
- ✅ Actualizaciones rápidas (solo Vercel)
- ✅ Autenticación sin cambios
- ✅ Lógica sensible en el servidor

## 📋 Comandos Rápidos

```bash
# Sincronizar cambios web con Android
npm run android:sync

# Abrir proyecto en Android Studio
npm run android:open

# Generar APK de debug
cd android
.\gradlew assembleDebug

# Generar App Bundle para Play Store
cd android
.\gradlew bundleRelease

# Limpiar build
cd android
.\gradlew clean
```

## 🔧 Archivos de Configuración Principales

En la raíz del proyecto:

- **`capacitor.config.ts`** - Configuración de Capacitor
- **`next.config.ts`** - Configuración de Next.js (export mode)
- **`package.json`** - Scripts de Android agregados

En la carpeta `android/`:

- **`android/app/src/main/AndroidManifest.xml`** - Manifest de Android
- **`android/app/src/main/res/xml/network_security_config.xml`** - Seguridad de red
- **`android/app/build.gradle`** - Configuración de build
- **`android/gradle.properties`** - Propiedades de Gradle

## ⚙️ Configuración Actual

```typescript
// capacitor.config.ts
{
  appId: 'com.oaci.app',
  appName: 'OACI.ai',
  webDir: 'out',
  server: {
    url: 'https://oaci-ai.vercel.app',  // PRODUCCIÓN
    cleartext: false
  }
}
```

## 🐛 Problemas Comunes

### Error: "SDK location not found"
→ Ver **BUILD_GUIDE.md** sección "Troubleshooting"

### Error: "Invalid redirect URL" (Clerk)
→ Ver **CLERK_SETUP.md** sección "Troubleshooting"

### La app no carga
→ Ver **BUILD_GUIDE.md** sección "Troubleshooting"

### Problemas con Gradle
→ Ver **BUILD_GUIDE.md** sección "Troubleshooting"

## 📱 Estado del Proyecto

- **Capacitor**: ✅ v7.4.4 instalado
- **Android Platform**: ✅ Agregada y sincronizada
- **Java JDK**: ✅ v17.0.15 detectado
- **Configuración**: ✅ Completa
- **Documentación**: ✅ Completa

## 🎯 Próximos Pasos

1. [ ] Instalar Android Studio
2. [ ] Configurar ANDROID_HOME
3. [ ] Abrir proyecto: `npm run android:open`
4. [ ] Crear emulador (Pixel 6, Android 13)
5. [ ] Configurar dominios en Clerk Dashboard
6. [ ] Ejecutar la app en el emulador
7. [ ] Probar autenticación
8. [ ] Generar APK de debug
9. [ ] Probar en dispositivo físico
10. [ ] Preparar para Play Store

## 📚 Recursos Externos

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Clerk Mobile Apps](https://clerk.com/docs/deployments/mobile)
- [Play Store Publishing](https://developer.android.com/studio/publish)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la sección de Troubleshooting en **BUILD_GUIDE.md**
2. Consulta **CLERK_SETUP.md** para problemas de autenticación
3. Verifica los logs en Android Studio (Logcat)
4. Inspecciona la WebView: `chrome://inspect`

---

**Última actualización**: 2025-11-26  
**Versión de Capacitor**: 7.4.4  
**App ID**: com.oaci.app
