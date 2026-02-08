# Generación de factura en PDF – Paso a paso

## Objetivo

Poder obtener una factura en PDF a partir de un registro de factura guardado en la base de datos (por ID), con datos del taller, cliente, trabajo y totales.

---

## Paso 1: Instalar la librería para generar PDF

Usamos **PDFKit**: genera PDF desde Node sin usar navegador, es ligera y se controla por código (texto, líneas, tablas).

```bash
npm install pdfkit
npm install -D @types/pdfkit
```

- **pdfkit**: escribe el PDF en un stream (buffer o archivo).
- **@types/pdfkit**: tipos para TypeScript.

---

## Paso 2: Obtener todos los datos necesarios para la factura

Para armar el PDF necesitamos:

- **Factura:** numeroFactura, subtotal, impuestos, total, fechaEmision.
- **Taller:** nombre, RNC, teléfono, dirección (para el encabezado “quien factura”).
- **Trabajo:** codigoTrabajo, descripcionPieza (y si aplica, estado).
- **Cliente (del trabajo):** nombre, teléfono, email, empresa (para “cliente”).
- **Servicios del trabajo (TrabajoServicio):** servicio (nombre, código), cantidad, precioUnitario (para la tabla de ítems).

En el **FacturasService** haremos un `findOne` que no solo traiga la factura, sino también:

- `trabajo` con `cliente` y `serviciosEnTrabajo` (incluyendo `servicio`).
- `taller`.

Así en un solo query tenemos todo para rellenar el PDF.

---

## Paso 3: Crear un generador de PDF (plantilla en código)

Crearemos un módulo o utilidad (por ejemplo `FacturaPdfService` o función en un archivo `factura-pdf.generator.ts`) que:

1. Reciba un objeto con: factura, taller, trabajo, cliente, líneas (servicios del trabajo).
2. Cree un documento con **PDFKit** (nuevo `PDFDocument()`).
3. Escriba en el PDF, en orden:
   - Encabezado: nombre del taller, RNC, contacto, “FACTURA”.
   - Número y fecha de factura.
   - Datos del cliente (nombre, teléfono, etc.).
   - Tabla: ítems (servicio, cantidad, precio unitario, subtotal línea).
   - Subtotal, impuestos, total.
4. Finalice el documento (`doc.end()`) y devuelva el **buffer** (o stream) del PDF.

Ese buffer es lo que después devolveremos en el endpoint.

---

## Paso 4: Endpoint para descargar / ver el PDF

En el **FacturasController**:

- **GET** `facturas/:id/pdf`
  - Llama al servicio para obtener la factura con relaciones (paso 2).
  - Si no existe factura (o no corresponde al taller), responder 404.
  - Llama al generador de PDF (paso 3) con esos datos.
  - Responde con:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="factura-{numeroFactura}.pdf"` (para descarga)  
      o `inline` (para abrir en el navegador).
  - El cuerpo de la respuesta es el buffer del PDF.

El cliente (navegador o app) podrá abrir o descargar directamente el archivo.

---

## Paso 5: (Opcional) Validar que la factura exista y corresponda al taller

- En el servicio, al cargar la factura por ID, comprobar que exista.
- Si en tu API el “taller” viene por usuario autenticado o por query, validar que `factura.tallerId` coincida con ese taller antes de generar el PDF (y si no, 403 o 404).

---

## Resumen del flujo

```
Cliente pide GET /facturas/:id/pdf
    → Controller recibe id
    → Service obtiene Factura + Trabajo + Cliente + Taller + Servicios del trabajo
    → Generador recibe esos datos y crea el PDF con PDFKit
    → Controller responde con Content-Type: application/pdf y el buffer
    → Navegador muestra o descarga el PDF
```

---

## Orden de implementación sugerido

1. Instalar **pdfkit** (y tipos).
2. Implementar en **FacturasService** el método que trae la factura con todas las relaciones necesarias.
3. Crear el **generador de PDF** (función o servicio) que recibe esos datos y devuelve un buffer.
4. Añadir en **FacturasController** el endpoint `GET :id/pdf` que use el servicio y el generador y devuelva el PDF.

Si quieres, en el siguiente mensaje podemos bajar al código y hacer juntos el Paso 2 (query de la factura) y el Paso 3 (primera versión del PDF con encabezado, cliente, tabla e totales).
