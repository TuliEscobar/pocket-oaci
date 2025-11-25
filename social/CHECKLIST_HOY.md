# ✅ Checklist para HOY - 25 de Noviembre

## 🎯 Objetivo del Día
Configurar perfiles de redes sociales con los assets visuales creados y preparar el contenido de lanzamiento.

---

## 📋 FASE 1: Organizar Assets (15 min)

- [ ] Descargar todas las imágenes generadas desde la carpeta de Gemini
- [ ] Crear carpeta `social/assets/` en tu proyecto
- [ ] Copiar las 7 imágenes a esa carpeta:
  - `oaci_logo_profile.png`
  - `twitter_banner.png`
  - `linkedin_banner.png`
  - `app_screenshot_demo.png`
  - `before_after_comparison.png`
  - `how_it_works_infographic.png`
  - `use_cases_grid.png`
- [ ] Hacer backup en Google Drive o OneDrive

**Ubicación de las imágenes generadas:**
```
C:\Users\tulie\.gemini\antigravity\brain\32ad82f7-5256-4eab-af17-12954f52dfd7\
```

---

## 🐦 FASE 2: Configurar Twitter/X (30 min)

### Paso 1: Crear/Actualizar Cuenta
- [ ] Ir a twitter.com/settings/profile
- [ ] Cambiar nombre a: `OACI.ai ✈️`
- [ ] Cambiar username a: `@OACI_ai` (o similar disponible)

### Paso 2: Configurar Perfil
- [ ] **Foto de perfil:** Subir `oaci_logo_profile.png`
- [ ] **Banner:** Subir `twitter_banner.png`
- [ ] **Bio:** 
```
Tu copiloto regulatorio con IA 🤖
Respuestas instantáneas sobre ICAO & RAAC con fuentes verificadas.
🇦🇷 ARG | 🌍 ICAO
👇 Pruébalo gratis
```
- [ ] **Ubicación:** Buenos Aires, Argentina
- [ ] **Sitio web:** https://pocket-oaci.vercel.app

### Paso 3: Preparar Primer Tweet
- [ ] Escribir el hilo de presentación (3 tweets)
- [ ] Adjuntar `app_screenshot_demo.png` al primer tweet
- [ ] Programar para mañana a las 9:00 AM

**Texto del hilo (copiar):**

**Tweet 1/3:**
```
👋 Hola, aviación.

Soy OACI.ai, y vengo a resolver un problema que todos conocemos:

Encontrar información regulatoria es LENTO y FRUSTRANTE.

Déjame mostrarte cómo lo solucionamos 🧵
```

**Tweet 2/3:**
```
Imagina esto:

Estás preparando un vuelo y necesitas confirmar los mínimos VFR.

En vez de abrir 3 PDFs y buscar 10 minutos...

Le preguntas a OACI.ai y obtienes la respuesta en 5 segundos. Con la cita exacta.

Así de simple.
```

**Tweet 3/3:**
```
¿Cómo funciona?

🤖 IA entrenada con documentos oficiales (ICAO, RAAC)
📚 Base de datos vectorial (RAG)
🎯 Citas precisas (nada de "alucinaciones")
🌍 Bilingüe (ES/EN)

Pruébalo ahora (es gratis):
https://pocket-oaci.vercel.app

¿Preguntas? Respondo todo 👇
```

### Paso 4: Seguir Cuentas Relevantes
- [ ] Seguir 10-15 cuentas de aviación (ver `TWITTER_CUENTAS_SEGUIR.md`)
- [ ] Seguir ANAC Argentina
- [ ] Seguir escuelas de vuelo argentinas
- [ ] Seguir pilotos influencers

---

## 💼 FASE 3: Preparar LinkedIn (Dejar para mañana)

**NOTA:** Como dijiste que LinkedIn lo dejas para mañana, solo prepara esto:

- [ ] Leer `LINKEDIN_GUIA_COMPLETA.md`
- [ ] Tener listas las imágenes:
  - Logo: `oaci_logo_profile.png`
  - Banner: `linkedin_banner.png`
- [ ] Tener listo el texto del primer post (está en la guía)

---

## 📱 FASE 4: WhatsApp - Preparar Mensajes (20 min)

- [ ] Abrir `WHATSAPP_MENSAJES.md`
- [ ] Identificar 5-10 contactos clave del ambiente aeronáutico
- [ ] Personalizar el "Mensaje Principal - Versión 1" para cada uno
- [ ] **NO ENVIAR TODAVÍA** - Esperar a que Twitter esté activo
- [ ] Programar envío para mañana después del lanzamiento en redes

---

## 📊 FASE 5: Verificar Base de Datos (10 min)

- [ ] Revisar si el script de embeddings terminó
- [ ] Verificar que los nuevos documentos estén procesados
- [ ] Hacer una prueba en https://pocket-oaci.vercel.app
- [ ] Confirmar que las respuestas incluyen los nuevos docs

**Comando para verificar:**
```powershell
cd c:\Users\tulie\OneDrive\Escritorio\OACI.ai\pocket-oaci
npx tsx scripts/4-upload-to-pinecone.ts
```

---

## 🎨 FASE 6: Crear Carpeta de Assets (5 min)

- [ ] Crear estructura de carpetas:
```
social/
  assets/
    logos/
    banners/
    screenshots/
    infographics/
```

- [ ] Organizar las imágenes en sus carpetas correspondientes
- [ ] Crear un archivo `README.md` en `assets/` con descripción de cada imagen

---

## 📝 FASE 7: Preparar Calendario de Contenido (15 min)

- [ ] Abrir `TWITTER_CALENDAR_WEEK1.md`
- [ ] Revisar el contenido planificado
- [ ] Asignar una imagen a cada día:
  - Día 1: `app_screenshot_demo.png`
  - Día 2: `before_after_comparison.png`
  - Día 3: `use_cases_grid.png`
  - Día 4: `app_screenshot_demo.png` (otro ángulo)
  - Día 5: `how_it_works_infographic.png`

- [ ] Escribir los 5 tweets en un documento
- [ ] Tenerlos listos para copiar/pegar

---

## ⏰ RESUMEN DE TIEMPOS

| Fase | Tiempo Estimado | Prioridad |
|------|----------------|-----------|
| Organizar Assets | 15 min | 🔴 Alta |
| Configurar Twitter | 30 min | 🔴 Alta |
| Preparar WhatsApp | 20 min | 🟡 Media |
| Verificar BD | 10 min | 🟡 Media |
| Crear Carpetas | 5 min | 🟢 Baja |
| Calendario | 15 min | 🟡 Media |
| **TOTAL** | **~95 min** | |

---

## 🚀 PARA MAÑANA (26 Nov)

### Mañana temprano:
1. Publicar hilo de presentación en Twitter (9:00 AM)
2. Crear página de LinkedIn
3. Publicar primer post en LinkedIn (10:00 AM)
4. Enviar mensajes de WhatsApp a contactos clave (11:00 AM)
5. Monitorear comentarios y responder

### Métricas a trackear:
- Impresiones del primer tweet
- Clicks al link
- Nuevos seguidores
- Respuestas en WhatsApp

---

## 💡 Tips Importantes

### ✅ Hacer:
- Responder TODOS los comentarios en las primeras 2 horas
- Usar hashtags relevantes pero no más de 3-4
- Incluir siempre una imagen en cada post
- Ser auténtico y personal en las respuestas

### ❌ Evitar:
- Spam (máximo 1 mensaje por grupo de WhatsApp)
- Sonar muy "vendedor" o corporativo
- Ignorar comentarios negativos
- Publicar sin imagen

---

## 📞 Si Necesitas Ayuda

**Tengo listo para ti:**
- ✅ 7 imágenes profesionales
- ✅ Textos para todos los posts
- ✅ Calendario de contenido
- ✅ Guías completas de configuración

**Puedes pedirme:**
- Ajustar textos de los posts
- Crear más variaciones de imágenes (mañana cuando se restablezca la cuota)
- Ayuda con la configuración técnica
- Revisar tus posts antes de publicar

---

## ✨ Motivación

Estás a punto de lanzar algo increíble. OACI.ai resuelve un problema real que miles de profesionales de la aviación enfrentan todos los días.

**Recuerda:**
- No necesitas ser perfecto, necesitas empezar
- El feedback temprano es oro
- Cada usuario es un aprendizaje
- La comunidad aeronáutica es colaborativa

**¡Vamos con todo! ✈️🚀**

---

**Última actualización:** 25 de Noviembre, 2025 - 16:55
