# SAS Taller – API para el frontend

Guía de la API para implementar el frontend: base URL, autenticación, rutas, cuerpos de petición y flujos recomendados.

---

## 1. Base URL y Swagger

- **Base URL (desarrollo):** `http://localhost:3000` (o el `PORT` definido en `.env`).
- **Swagger (documentación interactiva):** `http://localhost:3000/api`.

Todas las rutas que se indican más abajo son relativas a la base URL (ej.: `GET /taller` → `GET http://localhost:3000/taller`).

---

## 2. Autenticación (JWT)

### Login

- **POST** `/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "admin@demo.com",
    "password": "123456"
  }
  ```
- **Respuesta 200:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Respuesta 401:** credenciales inválidas.

### Uso del token

Solo **algunas rutas** exigen token (por ahora: crear/actualizar/eliminar **taller**). Para esas peticiones envía el header:

```
Authorization: Bearer <access_token>
```

El payload del JWT incluye (útil para el front si lo decodificas):

- `sub`: id del usuario  
- `email`  
- `rol`: `SUPER_ADMIN` | `ADMIN` | `EMPLEADO`  
- `tallerId`: UUID del taller del usuario  

En el front puedes guardar `access_token` y, si lo necesitas, `tallerId`/`rol` (en memoria o en almacenamiento local) para filtrar datos por taller o mostrar solo lo que corresponde al usuario.

---

## 3. Modelo de datos (resumen)

- **Taller** es la raíz: cada taller tiene sus propios **usuarios**, **empleados**, **clientes**, **servicios**, **trabajos**, **facturas**.
- Un **trabajo** es una pieza/orden que entra al taller; tiene un **cliente**, opcionalmente un **empleado** asignado, y varios **servicios** (vía tabla N:N TrabajoServicio).
- De un trabajo se generan **facturas**, **pagos** y **notificaciones** (email/WhatsApp).

**Enums útiles:**

| Entidad   | Campo / Uso      | Valores                                                                 |
|-----------|------------------|-------------------------------------------------------------------------|
| Trabajo   | estado           | `PENDIENTE`, `EN_PROCESO`, `TERMINADO`, `ENTREGADO`                     |
| Pago      | metodoPago       | `EFECTIVO`, `TARJETA`, `TRANSFERENCIA`, `CHEQUE`, `OTRO`                |
| Pago      | estado           | `PENDIENTE`, `COMPLETADO`, `ANULADO`                                    |
| Notificación | tipo          | `EMAIL`, `WHATSAPP`                                                     |

---

## 4. Rutas por recurso

### 4.1 Taller

| Método   | Ruta          | Auth | Descripción              |
|----------|---------------|------|--------------------------|
| GET      | `/taller`     | No   | Listar todos los talleres |
| GET      | `/taller/:id` | No   | Obtener un taller por UUID |
| POST     | `/taller`     | **Sí** (JWT) | Crear taller |
| PUT      | `/taller/:id` | **Sí** (JWT) | Actualizar taller |
| DELETE   | `/taller/:id` | **Sí** (JWT) | Eliminar taller |

**POST/PUT body (ejemplo):**
```json
{
  "nombre": "Taller García",
  "rnc": "1-31-12345-6",
  "telefono": "809-555-0000",
  "email": "contacto@tallergarcia.com",
  "direccion": "Calle Principal 100",
  "activo": true
}
```
Campos obligatorios: `nombre`. El resto son opcionales.

---

### 4.2 Servicio (catálogo por taller)

Cada taller ve y gestiona **solo sus servicios**. No requiere JWT; el filtro es por `tallerId` (query o body).

| Método   | Ruta              | Query obligatorio / Body      | Descripción |
|----------|-------------------|-------------------------------|-------------|
| GET      | `/servicio`       | `tallerId` (UUID)             | Listar servicios del taller. Opcional: `soloActivos=true` (default) o `false` |
| GET      | `/servicio/:id`   | `tallerId` (UUID)             | Obtener un servicio (solo si pertenece al taller) |
| POST     | `/servicio`       | Body con `tallerId`           | Crear servicio en ese taller |
| PATCH    | `/servicio/:id`   | `tallerId` (query)            | Actualizar (solo del taller indicado) |
| DELETE   | `/servicio/:id`   | `tallerId` (query)            | Desactivar servicio (soft delete) |

**POST body:**
```json
{
  "tallerId": "11111111-1111-1111-1111-111111111111",
  "nombre": "Rectificación de culata",
  "precio": 3500,
  "descripcion": "Rectificado de superficie"
}
```
El `codigo` se genera automáticamente a partir del nombre (ej. REC-CUL-01). No lo envíes en el create.

**Ejemplo para el front:** Tras login, usa `tallerId` del usuario (o del taller seleccionado) en todas las llamadas a `/servicio` (query o body según la tabla).

---

### 4.3 Clientes

| Método   | Ruta              | Query / Body   | Descripción |
|----------|-------------------|----------------|-------------|
| GET      | `/clientes`       | `tallerId` (opcional) | Listar clientes; si envías `tallerId`, filtra por ese taller |
| GET      | `/clientes/:id`  | —              | Obtener cliente por UUID |
| POST     | `/clientes`      | Body con `tallerId` | Crear cliente |
| PUT      | `/clientes/:id`  | Body           | Actualizar cliente |
| DELETE   | `/clientes/:id`  | —              | Eliminar cliente |

**POST body:**
```json
{
  "tallerId": "11111111-1111-1111-1111-111111111111",
  "nombre": "María Rodríguez",
  "telefono": "809-555-0000",
  "email": "maria@empresa.com",
  "empresa": "Transportes Rodríguez",
  "notas": "Cliente preferencial"
}
```
Obligatorio: `tallerId`, `nombre`. Resto opcional.

---

### 4.4 Empleados

| Método   | Ruta               | Query / Body   | Descripción |
|----------|--------------------|----------------|-------------|
| GET      | `/empleados`       | `tallerId` (opcional) | Listar empleados |
| GET      | `/empleados/:id`   | —              | Obtener empleado por UUID |
| POST     | `/empleados`       | Body con `tallerId` | Crear empleado |
| PUT      | `/empleados/:id`   | Body           | Actualizar empleado |
| DELETE   | `/empleados/:id`   | —              | Eliminar empleado |

**POST body:**
```json
{
  "tallerId": "11111111-1111-1111-1111-111111111111",
  "nombre": "Carlos López",
  "telefono": "809-555-1234",
  "usuarioId": "uuid-opcional-si-vinculas-usuario",
  "porcentajeComision": 10.5,
  "activo": true
}
```

---

### 4.5 Trabajo

| Método   | Ruta              | Descripción |
|----------|-------------------|-------------|
| GET      | `/trabajo`        | Listar trabajos |
| GET      | `/trabajo/:id`    | Obtener trabajo por ID (UUID en backend; el controller actual usa `+id`, revisar si es numérico o UUID) |
| POST     | `/trabajo`        | Crear trabajo |
| PATCH    | `/trabajo/:id`    | Actualizar trabajo |
| DELETE   | `/trabajo/:id`    | Eliminar trabajo |

En el modelo de datos, un trabajo tiene: `tallerId`, `clienteId`, `empleadoId` (opcional), `codigoTrabajo`, `descripcionPieza`, `estado` (enum), `observaciones`, etc. Los DTOs del backend pueden estar en evolución; para el create/update conviene revisar Swagger o el código de `CreateTrabajoDto` / `UpdateTrabajoDto`.

---

### 4.6 Facturas

| Método   | Ruta              | Descripción |
|----------|-------------------|-------------|
| GET      | `/facturas`       | Listar facturas |
| GET      | `/facturas/:id`   | Obtener factura por UUID |
| GET      | `/facturas/:id/pdf` | **Descargar factura en PDF** (Content-Type: application/pdf) |
| POST     | `/facturas`       | Crear factura |
| PATCH    | `/facturas/:id`   | Actualizar factura |
| DELETE   | `/facturas/:id`   | Eliminar factura |

**POST body (CreateFacturaDto):**
```json
{
  "trabajoId": "uuid-del-trabajo",
  "tallerId": "uuid-del-taller",
  "numeroFactura": "F-2025-0001",
  "subtotal": 3000,
  "impuestos": 450,
  "total": 3450,
  "fechaEmision": "2025-02-04T12:00:00.000Z"
}
```
`fechaEmision` es opcional; si no se envía se usa la fecha actual.

**Front:** Para “Descargar PDF”, hacer `GET /facturas/:id/pdf` y guardar la respuesta como archivo (ej. con `Content-Disposition: attachment` el navegador ya puede descargarlo).

---

### 4.7 Pagos

| Método   | Ruta          | Descripción |
|----------|---------------|-------------|
| GET      | `/pagos`      | Listar pagos |
| GET      | `/pagos/:id`  | Obtener pago por ID |
| POST     | `/pagos`      | Crear pago |
| PATCH    | `/pagos/:id`  | Actualizar pago |
| DELETE   | `/pagos/:id`  | Eliminar pago |

En el modelo, un pago tiene `trabajoId`, `monto`, `metodoPago` (enum), `estado` (enum), `fechaPago`. Los DTOs pueden estar vacíos o en desarrollo; revisar Swagger o el código si necesitas el formato exacto del body.

---

### 4.8 Notificaciones

| Método   | Ruta                   | Descripción |
|----------|------------------------|-------------|
| GET      | `/notificaciones`      | Listar notificaciones |
| GET      | `/notificaciones/:id`  | Obtener una por ID |
| POST     | `/notificaciones`      | Crear notificación |
| PATCH    | `/notificaciones/:id`  | Actualizar |
| DELETE   | `/notificaciones/:id`  | Eliminar |

En el modelo: `clienteId`, `trabajoId`, `tipo` (EMAIL | WHATSAPP), `mensaje`, `enviado` (boolean).

---

### 4.9 Usuarios

| Método   | Ruta             | Descripción |
|----------|------------------|-------------|
| GET      | `/usuarios`      | Listar usuarios |
| GET      | `/usuarios/:id`  | Obtener usuario por UUID |
| POST     | `/usuarios`      | Crear usuario |
| PUT      | `/usuarios/:id`  | Actualizar usuario |
| DELETE   | `/usuarios/:id`  | Eliminar usuario |

Útil para gestión por parte de un admin (por ejemplo filtrar por `tallerId` si el backend lo soporta en query).

---

## 5. Flujo recomendado para el frontend

1. **Pantalla de login**  
   - POST `/auth/login` con `email` y `password`.  
   - Guardar `access_token` (y opcionalmente `tallerId`/`rol` decodificando el JWT o desde un endpoint de “me”).

2. **Contexto “taller actual”**  
   - Si el usuario tiene un solo taller, usar su `tallerId` del token.  
   - Si en el futuro hay selector de taller, guardar el `tallerId` elegido en estado global (context/Redux, etc.).

3. **Pantallas por recurso**  
   - **Talleres:** GET `/taller` y GET `/taller/:id` (sin token para listar/ver). Crear/editar/eliminar con token.  
   - **Servicios:** Todas las llamadas con `tallerId` (query o body según la ruta). Ej. listar: `GET /servicio?tallerId=...`.  
   - **Clientes / Empleados:** Listar con `tallerId` opcional; crear con `tallerId` en el body.  
   - **Trabajos:** Listar/crear/editar; asociar cliente, empleado y servicios (según modelo Trabajo + TrabajoServicio).  
   - **Facturas:** Crear desde un trabajo; descargar PDF con GET `/facturas/:id/pdf`.  
   - **Pagos / Notificaciones:** CRUD asociado a trabajos y clientes según el modelo.

4. **Manejo de errores**  
   - 400: validación (mensajes en el body).  
   - 401: no autorizado (token inválido o no enviado donde es requerido).  
   - 404: recurso no encontrado (ej. servicio de otro taller).  

5. **Validación**  
   - La API usa ValidationPipe (whitelist, forbidNonWhitelisted). Envía solo campos definidos en los DTOs y con los tipos indicados (UUID, números, etc.).

---

## 6. Datos de prueba (seed)

Tras ejecutar `npx prisma db seed` tienes:

- **2 talleres:** Taller Mecánico Demo, AutoServicio Norte.  
- **Usuarios** (contraseña para todos: `123456`):  
  - `superadmin@demo.com` (SUPER_ADMIN)  
  - `admin@demo.com`, `empleado@demo.com` (Taller Demo)  
  - `admin2@demo.com`, `empleado2@demo.com` (AutoServicio Norte)  
- **Por taller:** empleados, clientes, servicios, trabajos, facturas, pagos, notificaciones.

Puedes usar esos emails y la contraseña `123456` para probar login y las rutas que requieren JWT o que filtran por `tallerId`.

---

## 7. Resumen rápido de URLs

```
POST   /auth/login
GET    /taller
GET    /taller/:id
POST   /taller          [Authorization: Bearer]
PUT    /taller/:id      [Authorization: Bearer]
DELETE /taller/:id      [Authorization: Bearer]

GET    /servicio?tallerId=...&soloActivos=true
GET    /servicio/:id?tallerId=...
POST   /servicio        { tallerId, nombre, precio, descripcion? }
PATCH  /servicio/:id?tallerId=...
DELETE /servicio/:id?tallerId=...

GET    /clientes?tallerId=...
GET    /clientes/:id
POST   /clientes
PUT    /clientes/:id
DELETE /clientes/:id

GET    /empleados?tallerId=...
GET    /empleados/:id
POST   /empleados
PUT    /empleados/:id
DELETE /empleados/:id

GET    /trabajo
GET    /trabajo/:id
POST   /trabajo
PATCH  /trabajo/:id
DELETE /trabajo/:id

GET    /facturas
GET    /facturas/:id
GET    /facturas/:id/pdf
POST   /facturas
PATCH  /facturas/:id
DELETE /facturas/:id

GET    /pagos
GET    /pagos/:id
POST   /pagos
PATCH  /pagos/:id
DELETE /pagos/:id

GET    /notificaciones
GET    /notificaciones/:id
POST   /notificaciones
PATCH  /notificaciones/:id
DELETE /notificaciones/:id

GET    /usuarios
GET    /usuarios/:id
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
```

Con esta guía puedes implementar el frontend contra la API actual y ajustar cuando se añadan o cambien DTOs (por ejemplo Trabajo, Pago, Notificación) usando Swagger en `/api` como referencia al día.
