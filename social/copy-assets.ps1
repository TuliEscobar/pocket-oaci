# Script para Copiar Assets Visuales
# Ejecutar desde: pocket-oaci/social/

# Definir rutas
$sourceDir = "C:\Users\tulie\.gemini\antigravity\brain\32ad82f7-5256-4eab-af17-12954f52dfd7"
$destDir = ".\assets"

Write-Host "🎨 Copiando assets visuales..." -ForegroundColor Cyan
Write-Host ""

# Crear subdirectorios si no existen
$subdirs = @("logos", "banners", "screenshots", "infographics")
foreach ($dir in $subdirs) {
    $path = Join-Path $destDir $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "✅ Creada carpeta: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📁 Buscando imágenes en:" -ForegroundColor Yellow
Write-Host $sourceDir
Write-Host ""

# Mapeo de archivos a carpetas
$fileMapping = @{
    "oaci_logo_profile*.png" = "logos"
    "twitter_banner*.png" = "banners"
    "linkedin_banner*.png" = "banners"
    "app_screenshot_demo*.png" = "screenshots"
    "before_after_comparison*.png" = "infographics"
    "how_it_works_infographic*.png" = "infographics"
    "use_cases_grid*.png" = "infographics"
}

$copiedCount = 0

# Copiar archivos
foreach ($pattern in $fileMapping.Keys) {
    $targetSubdir = $fileMapping[$pattern]
    $files = Get-ChildItem -Path $sourceDir -Filter $pattern -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $destPath = Join-Path $destDir $targetSubdir
        $destFile = Join-Path $destPath $file.Name
        
        try {
            Copy-Item -Path $file.FullName -Destination $destFile -Force
            Write-Host "✅ Copiado: $($file.Name) → $targetSubdir/" -ForegroundColor Green
            $copiedCount++
        }
        catch {
            Write-Host "❌ Error copiando: $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Proceso completado!" -ForegroundColor Green
Write-Host "📊 Total de archivos copiados: $copiedCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Los assets están en: .\assets\" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisar las imágenes en cada carpeta"
Write-Host "  2. Optimizarlas con TinyPNG (opcional)"
Write-Host "  3. Subirlas a Twitter/LinkedIn según CHECKLIST_HOY.md"
Write-Host ""
