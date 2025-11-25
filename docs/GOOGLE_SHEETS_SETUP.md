# Configuración de Google Sheets para Waitlist

Esta guía te mostrará cómo conectar el formulario de registro con Google Sheets de forma simple y gratuita.

## Opción 1: Google Apps Script (Recomendado - Más Simple)

### Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja llamada "OACI.ai - Waitlist"
3. En la primera fila, agrega estos encabezados:
   - `Timestamp` (A1)
   - `Email` (B1)
   - `Role` (C1)
   - `Document` (D1)
   - `Pain Point` (E1)

### Paso 2: Crear el Apps Script

1. En tu Google Sheet, ve a **Extensiones → Apps Script**
2. Borra el código por defecto y pega este:

```javascript
function doPost(e) {
  try {
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parsear los datos del POST
    const data = JSON.parse(e.postData.contents);
    
    // Agregar una nueva fila con los datos
    sheet.appendRow([
      new Date(), // Timestamp
      data.email,
      data.role,
      data.document || '',
      data.painPoint || ''
    ]);
    
    // Respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Respuesta de error
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Haz clic en **Guardar** (icono de disco)
4. Haz clic en **Implementar → Nueva implementación**
5. Selecciona tipo: **Aplicación web**
6. Configuración:
   - **Descripción**: "OACI.ai Waitlist API"
   - **Ejecutar como**: "Yo"
   - **Quién tiene acceso**: "Cualquier persona"
7. Haz clic en **Implementar**
8. **COPIA LA URL** que te da (algo como `https://script.google.com/macros/s/ABC123.../exec`)
9. Haz clic en **Autorizar acceso** y acepta los permisos

### Paso 3: Configurar la Variable de Entorno

En tu archivo `.env.local`, agrega:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/TU_URL_AQUI/exec
```

---

## Opción 2: Usando Google Sheets API (Más Complejo)

Si prefieres usar la API oficial de Google Sheets (requiere más configuración):

### Paso 1: Crear Credenciales

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**
4. Ve a **Credenciales → Crear credenciales → Cuenta de servicio**
5. Descarga el archivo JSON de la cuenta de servicio
6. Comparte tu Google Sheet con el email de la cuenta de servicio (con permisos de editor)

### Paso 2: Configurar Variables de Entorno

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ABC123... (ID de tu hoja)
```

---

## ✅ Recomendación

**Usa la Opción 1 (Apps Script)** porque:
- ✅ No requiere configuración compleja
- ✅ No necesitas guardar claves privadas en tu código
- ✅ Es más rápido de implementar (5 minutos)
- ✅ Funciona perfectamente para un MVP

Una vez que tengas la URL del webhook de Apps Script, actualiza el archivo `.env.local` y ya estará funcionando.
