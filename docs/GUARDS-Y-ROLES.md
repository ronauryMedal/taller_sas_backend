# Guía: Guards y roles en SAS Taller

Cómo proteger rutas con JWT y restringir acceso por rol (ADMIN / EMPLEADO).

---

## 1. Qué hay disponible

| Recurso | Ubicación | Uso |
|--------|-----------|-----|
| **JwtAuthGuard** | `src/auth/jwt-auth.guard.ts` | Exige un JWT válido. Sin token → 401. Deja en `req.user` los datos del usuario (userId, email, rol, tallerId). |
| **RolesGuard** | `src/auth/roles.guard.ts` | Comprueba que `req.user.rol` sea uno de los roles indicados en `@Roles()`. Sin rol permitido → 403. |
| **@Roles(...)** | `src/auth/roles.decorator.ts` | Marca una ruta (o todo el controlador) con los roles que pueden acceder. |
| **Rol** | `src/auth/roles.enum.ts` | Enum: `Rol.ADMIN`, `Rol.EMPLEADO` (coincide con el enum en Prisma). |

Los guards y el decorador se pueden importar desde `src/auth` o desde los archivos concretos.

---

## 2. Importar AuthModule

Cualquier módulo que use **JwtAuthGuard** o **RolesGuard** debe importar **AuthModule** para que la estrategia JWT esté registrada.

```ts
// ej. clientes.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [AuthModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
```

---

## 3. Proteger rutas en un controlador

### Solo exigen estar logueado (cualquier rol)

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clientes')
export class ClientesController {
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.clientesService.findAll();
  }
}
```

- Petición **sin** `Authorization: Bearer <token>` → **401 Unauthorized**.
- Petición **con** token válido → se ejecuta el método y en `req.user` tienes `userId`, `email`, `rol`, `tallerId`.

---

### Solo un rol (ej. solo ADMIN)

```ts
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Rol } from '../auth/roles.enum';

@Controller('clientes')
export class ClientesController {
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
```

- Orden de guards: primero **JwtAuthGuard** (valida token y rellena `req.user`), luego **RolesGuard** (lee `req.user.rol` y lo compara con `@Roles`).
- Si el usuario está logueado pero no es ADMIN → **403 Forbidden** con mensaje de roles requeridos.

---

### Varios roles (ADMIN o EMPLEADO)

```ts
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN, Rol.EMPLEADO)
create(@Body() dto: CreateClienteDto) {
  return this.clientesService.create(dto);
}
```

Solo usuarios con rol **ADMIN** o **EMPLEADO** pueden acceder.

---

### Aplicar a todo el controlador

```ts
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  // Todas las rutas exigen JWT

  @Get()
  findAll() { ... }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string) { ... }
}
```

- Todas las rutas: obligatorio JWT.
- Solo `remove`: además solo rol ADMIN.

---

## 4. Orden de los guards

Siempre que uses **RolesGuard** pon antes **JwtAuthGuard**:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
```

Así primero se valida el token y se rellena `req.user`; después RolesGuard puede leer `req.user.rol`.

---

## 5. Obtener el usuario en el método

El usuario está en `req.user` (lo rellena la estrategia JWT):

```ts
import { Request } from 'express';

@Get('mi-perfil')
@UseGuards(JwtAuthGuard)
miPerfil(@Req() req: Request) {
  const user = req.user as { userId: string; email: string; rol: string; tallerId: string };
  return this.someService.findByUserId(user.userId);
}
```

O con un decorador propio (opcional) puedes crear `@User()` que devuelva `req.user` para no usar `@Req()` cada vez.

---

## 6. Resumen rápido

| Objetivo | Decoradores / Guards |
|----------|----------------------|
| Ruta pública (sin login) | No poner ningún guard. |
| Solo login (cualquier rol) | `@UseGuards(JwtAuthGuard)` |
| Solo ADMIN | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Rol.ADMIN)` |
| ADMIN o EMPLEADO | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Rol.ADMIN, Rol.EMPLEADO)` |

- El módulo del controlador debe **importar AuthModule**.
- Login: **POST /auth/login** con body `{ "email": "...", "password": "..." }` → respuesta con `access_token`. En las peticiones protegidas envía el header: **Authorization: Bearer &lt;access_token&gt;**.

---

## 7. Ejemplo de flujo

1. Usuario hace **POST /auth/login** → recibe `access_token`.
2. Para llamar a **DELETE /taller/:id** (protegido con JwtAuthGuard + RolesGuard + Rol.ADMIN):
   - Header: `Authorization: Bearer <access_token>`.
   - Si el token es válido y el usuario tiene rol ADMIN → 200 y se ejecuta el delete.
   - Si el token es inválido o falta → 401.
   - Si el token es válido pero el usuario no es ADMIN → 403.

Con esta guía puedes reutilizar los guards y el decorador `@Roles` en cualquier controlador del proyecto.
