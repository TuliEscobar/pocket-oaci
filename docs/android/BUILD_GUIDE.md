# 📱 Guía para Crear la App Android de OACI.ai

Esta guía te explica cómo convertir tu aplicación web Next.js de OACI.ai en una aplicación Android nativa usando Capacitor.

## 🎯 Arquitectura de la App

La app Android funciona como una **aplicación híbrida**:
- **Frontend**: Se ejecuta localmente en el dispositivo (WebView)
- **Backend**: Se conecta a tu servidor Next.js en Vercel
- **Autenticación**: Usa Clerk (funciona normalmente)
- **API Calls**: Se envían a `https://oaci-ai.vercel.app/api/chat`

## 📋 Prerrequisitos

### 1. **Java Development Kit (JDK)**
```bash
# Verifica si tienes JDK instalado
java -version

# Debes tener JDK 17 o superior
# Descarga desde: https://adoptium.net/
```

### 2. **Android Studio**
- Descarga desde: https://developer.android.com/studio
- Durante la instalación, asegúrate de instalar:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (para emulador)

### 3. **Variables de Entorno**
Agrega a tu PATH (Windows):
```
ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
```

Y agrega a PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

## 🚀 Proceso de Build

### Paso 1: Construir la Aplicación Web

**IMPORTANTE**: Como tu app usa rutas API de servidor, NO podemos hacer un build estático completo. La configuración actual apunta directamente a tu servidor de Vercel.

```bash
# La app Android se conectará directamente a tu servidor de Vercel
# No necesitas hacer build de Next.js para desarrollo
```

### Paso 2: Sincronizar con Android

```bash
npm run android:sync
```

Este comando:
- Copia los assets web al proyecto Android
- Actualiza las dependencias de Capacitor
- Configura los plugins nativos

### Paso 3: Abrir en Android Studio

```bash
npm run android:open
```

Esto abrirá el proyecto en Android Studio.

## 🔧 Configuración en Android Studio

### 1. **Primera vez que abres el proyecto**
- Android Studio descargará dependencias (puede tardar varios minutos)
- Espera a que termine el "Gradle Sync"

### 2. **Configurar el Emulador**
- Ve a `Tools > Device Manager`
- Crea un nuevo dispositivo virtual (AVD)
- Recomendado: Pixel 6 con Android 13 (API 33)

### 3. **Ejecutar la App**
- Haz clic en el botón verde ▶️ "Run"
- Selecciona tu emulador o dispositivo físico
- La app se instalará y ejecutará

## 🌐 Modos de Desarrollo

### Modo Producción (Actual)
```typescript
// capacitor.config.ts
server: {
  url: 'https://oaci-ai.vercel.app',
  cleartext: false
}
```
- ✅ Usa tu servidor de Vercel en producción
- ✅ Autenticación funciona
- ✅ Todas las features disponibles
- ⚠️ Requiere conexión a internet

### Modo Desarrollo (Opcional)
```typescript
// capacitor.config.ts
server: {
  url: 'http://localhost:3000',
  cleartext: true
}
```
- ✅ Desarrollo más rápido
- ✅ Hot reload
- ⚠️ Requiere que Next.js esté corriendo localmente
- ⚠️ Solo funciona en emulador (no en dispositivo físico)

## 📦 Generar APK para Distribución

### APK de Debug (para testing)
```bash
cd android
./gradlew assembleDebug
```
El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### APK de Release (para producción)

#### 1. Crear un Keystore
```bash
keytool -genkey -v -keystore oaci-release-key.keystore -alias oaci -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Configurar el Signing
Edita `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../oaci-release-key.keystore')
            storePassword 'TU_PASSWORD'
            keyAlias 'oaci'
            keyPassword 'TU_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 3. Generar APK firmado
```bash
cd android
./gradlew assembleRelease
```
El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

## 🎨 Personalización

### Icono de la App
1. Crea un icono de 1024x1024px
2. Usa [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
3. Reemplaza los archivos en `android/app/src/main/res/mipmap-*/`

### Splash Screen
Edita `android/app/src/main/res/values/styles.xml`:
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@drawable/splash</item>
</style>
```

### Nombre de la App
Edita `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">OACI.ai</string>
<string name="title_activity_main">OACI.ai</string>
```

## 🐛 Troubleshooting

### Error: "SDK location not found"
Crea `android/local.properties`:
```
sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
```

### Error: "Cleartext HTTP traffic not permitted"
Asegúrate de que `cleartext: false` en producción, o agrega a `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### La app se ve mal en el emulador
- Verifica que tu servidor de Vercel esté funcionando
- Abre Chrome DevTools: `chrome://inspect` → Inspeccionar la WebView

### Problemas con Clerk
- Asegúrate de agregar `https://oaci-ai.vercel.app` a los dominios permitidos en Clerk Dashboard
- Verifica que las cookies funcionen correctamente

## 📱 Publicar en Google Play Store

### 1. Crear una cuenta de desarrollador
- Ve a [Google Play Console](https://play.google.com/console)
- Paga la tarifa única de $25 USD

### 2. Preparar el App Bundle (AAB)
```bash
cd android
./gradlew bundleRelease
```
El AAB estará en: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Subir a Play Console
- Crea una nueva aplicación
- Completa el formulario de la tienda (descripción, screenshots, etc.)
- Sube el AAB
- Completa la revisión de contenido
- Envía para revisión

### 4. Screenshots requeridos
- Teléfono: 2-8 screenshots (mínimo 320px en el lado corto)
- Tablet 7": 1-8 screenshots (opcional)
- Tablet 10": 1-8 screenshots (opcional)

## 🔄 Workflow de Actualización

Cuando actualices tu app:

1. **Actualiza el código en Vercel** (como siempre)
2. **Si hay cambios en el frontend nativo**:
   ```bash
   npm run android:sync
   npm run android:open
   # Incrementa versionCode en android/app/build.gradle
   # Genera nuevo APK/AAB
   ```

## 📊 Versioning

Edita `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1      // Incrementa con cada release
        versionName "1.0"  // Versión visible para usuarios
    }
}
```

## 🎯 Próximos Pasos

1. ✅ Configurar Android Studio
2. ✅ Probar en emulador
3. ✅ Generar APK de debug
4. ⬜ Crear keystore de release
5. ⬜ Generar APK firmado
6. ⬜ Probar en dispositivo físico
7. ⬜ Crear cuenta de Google Play
8. ⬜ Preparar assets de la tienda
9. ⬜ Publicar en Play Store

## 📚 Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Guía de Android Studio](https://developer.android.com/studio/intro)
- [Publicar en Play Store](https://developer.android.com/studio/publish)
- [Clerk en Apps Móviles](https://clerk.com/docs/deployments/mobile)

---

**¿Necesitas ayuda?** Revisa la sección de troubleshooting o contacta al equipo de desarrollo.
