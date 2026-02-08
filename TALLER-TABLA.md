# Tabla TALLER – Qué es necesario, qué se hizo y por qué

Esta guía explica la tabla **TALLER** (tabla raíz del sistema): qué hace falta para que funcione, qué archivos se crearon y el motivo de cada decisión.

---

## 1. Qué es necesario (requisitos)

Para que la tabla TALLER exista y la API funcione necesitas:

| Requisito | Para qué sirve |
|-----------|----------------|
| **Base de datos** | PostgreSQL creado y accesible (o SQLite si cambias el schema). |
| **Archivo `.env`** | Variable `DATABASE_URL` para que Prisma se conecte a la BD. |
| **Schema de Prisma** | Define la “forma” de la tabla (campos y tipos) en código. |
| **Migración** | Lleva ese schema a la base de datos real (crea la tabla). |
| **Cliente de Prisma** | Código TypeScript generado para leer/escribir en la BD. |
| **Módulo NestJS (Taller)** | Servicio + controlador que exponen la lógica por HTTP. |

Sin estos pasos, la tabla no existe en la BD o la API no puede usarla.

---

## 2. Qué se hizo y por qué

### 2.1 Schema de Prisma (`prisma/schema.prisma`)

Aquí se define la tabla TALLER tal como la describiste:

| Campo (tu diseño) | En Prisma | Motivo |
|-------------------|-----------|--------|
| **id** (UUID, PK) | `id String @id @default(uuid())` | PK. Prisma no tiene tipo “UUID” nativo; se usa `String` y `@default(uuid())` para generar UUIDs automáticamente. |
| **nombre** (string) | `nombre String` | Nombre del taller, obligatorio. |
| **rnc** (string, opcional) | `rnc String?` | El `?` en Prisma significa “opcional” (nullable en BD). |
| **telefono** | `telefono String?` | Opcional por si no siempre se tiene. |
| **email** | `email String?` | Igual, opcional. |
| **direccion** | `direccion String?` | Opcional. |
| **activo** (boolean) | `activo Boolean @default(true)` | Por defecto el taller se considera activo. |
| **created_at** (datetime) | `createdAt DateTime @default(now())` | Fecha de creación; Prisma suele usar camelCase (`createdAt`) y `@default(now())` rellena la fecha al crear. |

**Relación (para más adelante):**  
En el schema está comentado: *1 taller → muchos usuarios, clientes, servicios, trabajos*. Cuando tengas esos modelos, añadirás en `Taller` líneas como `clientes Cliente[]` y en cada modelo hijo un `tallerId` y `taller Taller @relation(...)`.

**Por qué el schema:**  
Prisma no crea la tabla “a mano” en SQL. Tú defines el modelo aquí y luego generas migraciones; así el esquema de la BD y el código TypeScript quedan alineados.

---

### 2.2 Migración (lo que tú ejecutas)

Comando:

```bash
npm run prisma:migrate
```

Cuando pida un nombre, por ejemplo: `crear_tabla_taller`.

**Qué hace:**  
Prisma compara `prisma/schema.prisma` con el estado actual de la BD, genera un archivo SQL (en `prisma/migrations/`) con `CREATE TABLE ...` y lo ejecuta. Así la tabla TALLER pasa a existir realmente en PostgreSQL.

**Por qué es necesario:**  
El schema solo es la definición; sin migración la base de datos no tiene la tabla.

---

### 2.3 Cliente de Prisma (generado)

Comando:

```bash
npm run prisma:generate
```

**Qué hace:**  
Lee `prisma/schema.prisma` y genera código TypeScript (por ejemplo `node_modules/.prisma/client`) con tipos y métodos como `prisma.taller.findMany()`, `prisma.taller.create()`, etc.

**Por qué:**  
Para no escribir SQL a mano; usas `this.prisma.taller.*` en NestJS con tipos y autocompletado.

---

### 2.4 Módulo Taller en NestJS

Se crearon tres archivos que conectan la tabla con la API REST.

#### **`src/taller/taller.service.ts`**

- Inyecta `PrismaService` (que ya está configurado en el proyecto).
- Expone métodos: `findAll()`, `findOne(id)`, `create(data)`, `update(id, data)`, `remove(id)`.
- Cada método usa por dentro `this.prisma.taller.*` (findMany, findUnique, create, update, delete).

**Por qué un servicio:**  
La lógica de “cómo se lee/escribe en la BD” va en el servicio; el controlador solo recibe HTTP y delega.

#### **`src/taller/taller.controller.ts`**

- Rutas:
  - `GET /taller` → listar talleres.
  - `GET /taller/:id` → un taller por UUID.
  - `POST /taller` → crear taller (body: nombre, rnc, telefono, email, direccion, activo).
  - `PUT /taller/:id` → actualizar.
  - `DELETE /taller/:id` → eliminar.
- Usa decoradores de Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) para que la documentación en `/api` refleje estos endpoints.

**Por qué un controlador:**  
Es la capa HTTP: traduce peticiones (body, params) en llamadas al servicio y devuelve la respuesta.

#### **`src/taller/taller.module.ts`**

- Declara el controlador y el proveedor (TallerService).
- Se importa en `AppModule`.

**Por qué un módulo:**  
NestJS organiza la app en módulos; así todo lo de “taller” queda junto y reutilizable.

---

### 2.5 Registro en `AppModule`

En `src/app.module.ts` se añadió `TallerModule` en `imports`.

**Por qué:**  
Si no se importa el módulo, NestJS no registra las rutas de `/taller` ni el servicio, y la API de talleres no respondería.

---

## 3. Orden recomendado para que funcione

1. Crear `.env` con `DATABASE_URL` (y tener PostgreSQL creado).
2. Ejecutar `npm run prisma:migrate` (nombre ej.: `crear_tabla_taller`).
3. Ejecutar `npm run prisma:generate`.
4. Levantar la app: `npm run start:dev`.
5. Probar en el navegador o en Swagger (`http://localhost:3000/api`): por ejemplo `POST /taller` con `{ "nombre": "Mi Taller" }`.

---

## 4. Resumen

- **Necesario:** BD, `.env`, schema Prisma, migración, cliente generado y módulo NestJS (servicio + controlador + módulo registrado).
- **Qué se hizo:**  
  - Definir la tabla TALLER en `prisma/schema.prisma` (id UUID, nombre, rnc opcional, telefono, email, direccion, activo, created_at).  
  - Crear el módulo Taller (servicio que usa Prisma, controlador REST, módulo) y registrarlo en `AppModule`.  
- **Por qué:**  
  - Schema: una sola fuente de verdad para la forma de la tabla.  
  - Migración: crea la tabla en la BD.  
  - Generate: genera el cliente TypeScript.  
  - Servicio: centraliza el acceso a la BD.  
  - Controlador: expone la API HTTP.  
  - Módulo: organiza y activa todo en NestJS.

Cuando quieras, el siguiente paso es definir las tablas relacionadas (usuarios, clientes, servicios, trabajos) y enlazarlas a TALLER con `tallerId` y las relaciones en el schema.
