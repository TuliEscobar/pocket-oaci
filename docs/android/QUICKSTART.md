# Configuracion Completada - App Android OACI.ai

## Estado Actual ✅

- ✅ Capacitor instalado y configurado
- ✅ Plataforma Android agregada
- ✅ Java JDK 17 detectado
- ✅ Configuracion de red para desarrollo y produccion
- ✅ App configurada para conectarse a: https://oaci-ai.vercel.app

## Proximos Pasos

### 1. Instalar Android Studio
Descarga desde: https://developer.android.com/studio

Durante la instalacion, asegurate de instalar:
- Android SDK
- Android SDK Platform
- Android Virtual Device

### 2. Configurar Variables de Entorno (si no estan configuradas)

Agrega a las variables de entorno del sistema:
```
ANDROID_HOME=C:\Users\tulie\AppData\Local\Android\Sdk
```

Agrega a PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

### 3. Abrir el Proyecto en Android Studio

```bash
npm run android:open
```

O manualmente:
1. Abre Android Studio
2. File > Open
3. Selecciona la carpeta: `C:\Users\tulie\OneDrive\Escritorio\OACI.ai\pocket-oaci\android`

### 4. Crear un Emulador

En Android Studio:
1. Tools > Device Manager
2. Create Device
3. Selecciona: Pixel 6 (recomendado)
4. System Image: Android 13 (API 33)
5. Finish

### 5. Ejecutar la App

1. Espera a que Gradle termine de sincronizar
2. Selecciona tu emulador en la barra superior
3. Presiona el boton verde ▶️ "Run"
4. La app se instalara y abrira automaticamente

### 6. Probar la App

La app se conectara a tu servidor de Vercel (https://oaci-ai.vercel.app).
Deberias poder:
- Ver la interfaz de OACI.ai
- Iniciar sesion con Clerk
- Hacer consultas al modelo
- Ver las respuestas con citas

## Modos de Desarrollo

### Modo Produccion (Actual)
La app se conecta a Vercel. Requiere internet.

### Modo Desarrollo Local
Para desarrollo mas rapido, edita `capacitor.config.ts`:

```typescript
server: {
  url: 'http://10.0.2.2:3000',  // 10.0.2.2 = localhost en emulador Android
  cleartext: true
}
```

Luego ejecuta:
```bash
npm run dev          # En una terminal
npm run android:sync # En otra terminal
```

## Generar APK para Testing

### APK de Debug
```bash
cd android
.\gradlew assembleDebug
```

El APK estara en: `android\app\build\outputs\apk\debug\app-debug.apk`

Puedes instalarlo en cualquier dispositivo Android para probar.

## Troubleshooting

### Error: SDK location not found
Crea el archivo `android\local.properties`:
```
sdk.dir=C:\\Users\\tulie\\AppData\\Local\\Android\\Sdk
```

### La app no carga
1. Verifica que https://oaci-ai.vercel.app este funcionando
2. Abre Chrome DevTools: chrome://inspect
3. Busca tu dispositivo y selecciona "inspect"

### Problemas con Clerk
Asegurate de agregar el dominio de tu app Android en Clerk Dashboard:
- Dashboard > Configure > Domains
- Agrega: `capacitor://localhost`

## Documentacion Completa

Para mas detalles, consulta: `docs/ANDROID_BUILD_GUIDE.md`

## Comandos Utiles

```bash
npm run android:sync   # Sincronizar cambios web con Android
npm run android:open   # Abrir proyecto en Android Studio
npx cap sync android   # Sincronizar todo
npx cap copy android   # Copiar assets web
```

---

Configurado el: 2025-11-26
