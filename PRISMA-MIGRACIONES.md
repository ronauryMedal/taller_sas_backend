# Prisma: migraciones paso a paso

Esta guía explica cómo usar Prisma y las migraciones en el proyecto SAS Taller.

---

## 1. Qué es Prisma y qué son las migraciones

- **Prisma**: ORM que conecta tu app NestJS con la base de datos. Tienes un **schema** (`prisma/schema.prisma`) donde defines modelos (tablas) y Prisma genera el cliente para usarlos en TypeScript.
- **Migraciones**: archivos SQL que aplican cambios del schema a la base de datos (crear tablas, columnas, índices, etc.) de forma versionada y repetible.

**Flujo resumido:**  
Editas `schema.prisma` → creas una migración → Prisma aplica los cambios en la BD → usas `PrismaService` en tus servicios para leer/escribir datos.

---

## 2. Configuración inicial (solo una vez)

### 2.1 Variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`).
2. Copia el contenido de `.env.example` y ajusta la URL de la base de datos.

**PostgreSQL (ejemplo):**

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sas_taller?schema=public"
```

Sustituye `usuario`, `contraseña` y el nombre de la base (`sas_taller`) por los tuyos. La base debe existir en PostgreSQL antes de correr migraciones.

**SQLite (opcional, para desarrollo local sin instalar PostgreSQL):**

- En `prisma/schema.prisma` cambia el `datasource` a:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

- En `.env`:

```env
DATABASE_URL="file:./dev.db"
```

---

## 3. Uso diario: flujo de migraciones

### Paso 1: Editar el schema

Abre `prisma/schema.prisma` y define o modifica modelos. Ejemplo:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Cada cambio que quieras reflejar en la BD (nuevas tablas, columnas, índices) se hace aquí.

### Paso 2: Crear y aplicar la migración

En la raíz del proyecto:

```bash
npm run prisma:migrate
```

(O directamente: `npx prisma migrate dev`.)

- Te pedirá un **nombre** para la migración (ej: `init`, `add_user_table`). Ese nombre identifica la migración.
- Prisma:
  - Genera un archivo SQL en `prisma/migrations/` con los cambios.
  - Aplica ese SQL a la base de datos.
  - Regenera el cliente de Prisma (`@prisma/client`).

Después de esto, las tablas/columnas ya existen en la BD.

### Paso 3: Regenerar el cliente (cuando cambies el schema sin nueva migración)

Si solo cambias tipos o comentarios y no creas migración, o tras clonar el repo y aplicar migraciones, conviene regenerar el cliente:

```bash
npm run prisma:generate
```

Así tu código TypeScript usa siempre los modelos actualizados.

---

## 4. Comandos útiles

| Comando | Qué hace |
|--------|-----------|
| `npm run prisma:migrate` | Crea una nueva migración desde los cambios del schema y la aplica (desarrollo). |
| `npm run prisma:migrate:deploy` | Aplica migraciones pendientes **sin** crear nuevas (típico en producción/CI). |
| `npm run prisma:generate` | Regenera el cliente de Prisma según `schema.prisma`. |
| `npm run prisma:studio` | Abre Prisma Studio en el navegador para ver y editar datos. |

---

## 5. Usar Prisma en NestJS

El proyecto ya tiene un **PrismaModule** global y un **PrismaService** que extiende `PrismaClient`.

En cualquier servicio, inyecta `PrismaService` y usa los modelos definidos en el schema. Ejemplo:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data });
  }
}
```

No hace falta importar el módulo de Prisma en cada módulo: al ser `@Global()`, `PrismaService` está disponible en toda la app.

---

## 6. Resumen del flujo

1. **Configurar:** `.env` con `DATABASE_URL` y, si usas PostgreSQL, base de datos creada.
2. **Definir modelos:** editar `prisma/schema.prisma`.
3. **Aplicar cambios:** `npm run prisma:migrate` (nombre de migración cuando lo pida).
4. **Opcional:** `npm run prisma:generate` si no se ha generado el cliente.
5. **Usar en código:** inyectar `PrismaService` y llamar a `this.prisma.modelName.*`.

Para producción o CI, usar `npm run prisma:migrate:deploy` después de desplegar, sin crear nuevas migraciones desde ese entorno.
