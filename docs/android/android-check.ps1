# 🚀 Script de Inicio Rápido para Android

Write-Host "🔍 Verificando configuración de Android..." -ForegroundColor Cyan

# Verificar Java
Write-Host "`n📦 Verificando Java JDK..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java instalado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java no encontrado. Instala JDK 17+ desde https://adoptium.net/" -ForegroundColor Red
    exit 1
}

# Verificar Android SDK
Write-Host "`n📱 Verificando Android SDK..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME configurado: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME no configurado. Configúralo después de instalar Android Studio." -ForegroundColor Yellow
}

# Verificar estructura del proyecto
Write-Host "`n📂 Verificando estructura del proyecto..." -ForegroundColor Yellow
$requiredDirs = @(
    "android",
    "android\app",
    "android\app\src\main\assets"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir no existe" -ForegroundColor Red
    }
}

# Verificar archivos de configuración
Write-Host "`n⚙️  Verificando archivos de configuración..." -ForegroundColor Yellow
$requiredFiles = @(
    "capacitor.config.ts",
    "android\app\src\main\AndroidManifest.xml",
    "android\app\src\main\res\xml\network_security_config.xml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

Write-Host "`n📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Instala Android Studio si no lo tienes: https://developer.android.com/studio" -ForegroundColor White
Write-Host "2. Abre Android Studio y configura el SDK" -ForegroundColor White
Write-Host "3. Ejecuta: npm run android:open" -ForegroundColor White
Write-Host "4. En Android Studio, crea un emulador (AVD)" -ForegroundColor White
Write-Host "5. Presiona el botón verde ▶️ para ejecutar la app" -ForegroundColor White

Write-Host "`n✨ Configuración verificada. ¡Listo para desarrollar!" -ForegroundColor Green
