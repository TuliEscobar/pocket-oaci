# Configuración de Google Sheets para Waitlist

Este documento explica cómo configurar dos hojas de Google Sheets separadas para registros individuales y de empresas.

## Estructura de Datos

### Hoja 1: Usuarios Individuales
**Columnas:**
- Timestamp
- Email
- Role (Rol)
- Document (Documento más consultado)
- Pain Point (Mayor desafío)

### Hoja 2: Empresas
**Columnas:**
- Timestamp
- Email
- Company (Nombre de la empresa)
- Role (Rol en la empresa)
- Company Size (Tamaño de la empresa)
- Use Case (Para qué usarían OACI.ai)
- Custom Data (¿Necesitan cargar documentación propia?)
- Pain Point (Mayor desafío)

## Configuración de Google Apps Script

### 1. Crear las Hojas de Cálculo

1. Crea un nuevo Google Spreadsheet
2. Renombra la primera hoja a "Individual Users"
3. Crea una segunda hoja llamada "Companies"
4. Agrega los encabezados correspondientes en cada hoja

### 2. Script para Usuarios Individuales

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Individual Users');
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date();
    const email = data.email || '';
    const role = data.role || '';
    const document = data.document || '';
    const painPoint = data.painPoint || '';
    
    sheet.appendRow([timestamp, email, role, document, painPoint]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Script para Empresas

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Companies');
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date();
    const email = data.email || '';
    const company = data.company || '';
    const role = data.role || '';
    const companySize = data.companySize || '';
    const useCase = data.useCase || '';
    const customData = data.customData || '';
    const painPoint = data.painPoint || '';
    
    sheet.appendRow([timestamp, email, company, role, companySize, useCase, customData, painPoint]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Pasos para Desplegar

### Para Usuarios Individuales:
1. Abre tu Google Spreadsheet con la hoja "Individual Users"
2. Ve a **Extensiones** > **Apps Script**
3. Pega el script para usuarios individuales
4. Haz clic en **Implementar** > **Nueva implementación**
5. Selecciona tipo: **Aplicación web**
6. Configuración:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Copia la URL del webhook
8. Agrégala a `.env.local` como `GOOGLE_SHEETS_WEBHOOK_URL`

### Para Empresas:
1. Crea un NUEVO Google Spreadsheet con la hoja "Companies"
2. Ve a **Extensiones** > **Apps Script**
3. Pega el script para empresas
4. Haz clic en **Implementar** > **Nueva implementación**
5. Selecciona tipo: **Aplicación web**
6. Configuración:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Copia la URL del webhook
8. Agrégala a `.env.local` como `GOOGLE_SHEETS_COMPANY_WEBHOOK_URL`

## Variables de Entorno

Agrega estas líneas a tu archivo `.env.local`:

```bash
# Webhook para registros individuales
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_INDIVIDUAL_SCRIPT_ID/exec

# Webhook para registros de empresas
GOOGLE_SHEETS_COMPANY_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_COMPANY_SCRIPT_ID/exec
```

## Verificación

Para verificar que todo funciona:

1. Completa el formulario de waitlist como usuario individual
2. Verifica que los datos aparezcan en la hoja "Individual Users"
3. Completa el formulario como empresa
4. Verifica que los datos aparezcan en la hoja "Companies"

## Notas Importantes

- Los dos webhooks pueden apuntar al mismo spreadsheet (diferentes hojas) o a spreadsheets separados
- Si prefieres usar un solo spreadsheet, modifica los scripts para que usen `getSheetByName()` con el nombre correcto
- Asegúrate de que los encabezados de las columnas coincidan con el orden en `sheet.appendRow()`
- Los scripts están configurados para aceptar peticiones de cualquier origen (necesario para que funcione desde Vercel)
