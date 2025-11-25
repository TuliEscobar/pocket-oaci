# 🚀 Hoja de Ruta: Lanzamiento OACI.ai

**Fecha:** 26 de Noviembre, 2025 (Día 2)

Este documento es tu guía maestra para ejecutar el lanzamiento en redes sociales y continuar con el desarrollo.

---

## 📅 MAÑANA: Día de Lanzamiento (26 Nov)

### 🕘 09:00 AM - Twitter/X (Prioridad Alta)
- [ ] **Verificar:** Si programaste el hilo ayer, verifica que se haya publicado.
- [ ] **Publicar (si no lo hiciste):**
  - Usa el texto del "Hilo de Presentación" en `TWEETS_BANCO_CONTENIDO.md`.
  - Adjunta la imagen `assets/screenshots/app_screenshot_demo.png`.
- [ ] **Engagement:** Monitorea notificaciones y responde a CUALQUIER interacción en los primeros 60 minutos.

### 🕙 10:00 AM - LinkedIn (Prioridad Media)
- [ ] **Crear Página de Empresa:**
  - Sigue la guía en `LINKEDIN_GUIA_COMPLETA.md`.
  - Usa `assets/logos/oaci_logo_profile.png` y `assets/banners/linkedin_banner.png`.
- [ ] **Primer Post:**
  - Publica el texto de "Anuncio de Producto" (ver guía).
  - Adjunta la misma imagen que en Twitter o la infografía `before_after_comparison.png`.

### 🕚 11:00 AM - WhatsApp (Viralización)
- [ ] **Enviar Mensajes:**
  - Selecciona 5-10 contactos clave (pilotos, instructores).
  - Usa los scripts de `WHATSAPP_MENSAJES.md` (personalízalos).
  - **Clave:** Pide feedback honesto, no solo que lo compartan.

---

## 📊 Mantenimiento Diario

### 1. Monitoreo de la App
- Revisa los logs en Vercel si es posible.
- Prueba la app tú mismo una vez al día para asegurar que la API de Gemini responde rápido.

### 2. Redes Sociales
- **Twitter:** 1 tweet diario (usa el calendario en `TWITTER_CALENDAR_WEEK1.md`).
- **LinkedIn:** 2-3 posts por semana.
- **Responder:** El objetivo es crear comunidad. Responde con preguntas para generar conversación.

---

## 🛠️ Próximos Pasos Técnicos (Post-Lanzamiento)

Una vez que el lanzamiento esté rodando, vuelve al código:

1. **Selector de Jurisdicción:**
   - Implementar un switch claro en la UI para elegir entre "Solo RAAC" o "Solo ICAO".
   - Actualmente el sistema busca en todo, pero el usuario puede querer filtrar.

2. **Historial de Chat:**
   - Implementar persistencia local (localStorage) para que el usuario no pierda sus preguntas al recargar.

3. **Feedback Loop:**
   - Agregar botones de "👍/👎" en las respuestas para que los usuarios califiquen la calidad.

---

## 📂 Referencia de Archivos

- **Contenido:** `social/TWEETS_BANCO_CONTENIDO.md`
- **Imágenes:** `social/assets/`
- **Guía LinkedIn:** `social/LINKEDIN_GUIA_COMPLETA.md`
- **Mensajes WhatsApp:** `social/WHATSAPP_MENSAJES.md`

---

**¡Éxito en el lanzamiento! ✈️**
