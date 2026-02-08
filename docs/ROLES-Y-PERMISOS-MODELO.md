# Modelo de roles y permisos – SAS Taller

Documento para alinear lo que pides con lo implementado y lo pendiente.

---

## 1. Lo que quieres (resumen)

| Rol | Alcance | Puede |
|-----|---------|--------|
| **SUPER_ADMIN** | Toda la aplicación | Todo: crear/editar/eliminar talleres, **asignar a un usuario el rol ADMIN de su taller**, y cualquier otra acción. |
| **ADMIN** (de un taller) | Solo **su taller** (`tallerId` del JWT) | Crear empleados, configurar su taller (clientes, servicios, etc.). No puede crear otros talleres ni tocar datos de otros talleres. |
| **EMPLEADO** | Su taller | Operar trabajos, etc. (según lo que definas). |

Además:

- **Contraseña para cambios mayores**: para ciertas acciones sensibles (por ejemplo cambiar el rol de un usuario, eliminar taller, etc.) quieres **pedir de nuevo la contraseña**. Tú eliges en qué operaciones aplicarlo.

---

## 2. Lo que ya está implementado

| Aspecto | Estado |
|---------|--------|
| Roles en BD y JWT | ✅ Enum `Rol`: SUPER_ADMIN, ADMIN, EMPLEADO. El login devuelve JWT con `rol` y `tallerId`. |
| Crear/editar/eliminar **taller** | ✅ Solo **SUPER_ADMIN** (guards en `TallerController`). |
| Guards por rol | ✅ `JwtAuthGuard` + `RolesGuard` + `@Roles(Rol.xxx)`. |
| `tallerId` en el token | ✅ `req.user.tallerId` disponible para restringir al taller del usuario. |

---

## 3. Lo que falta o hay que reforzar

### 3.1 ADMIN solo ve y modifica **su** taller

Hoy muchos endpoints aceptan `tallerId` por query o body pero **no comprueban** que un ADMIN solo use su propio `tallerId`.

- **Objetivo**: Si el usuario es **ADMIN**, que no pueda leer/crear/editar datos de otro taller; usar siempre el `tallerId` que viene del JWT.
- **Cómo**: En cada módulo (usuarios, empleados, clientes, servicio, trabajo, pagos, facturas, notificaciones):
  - En los métodos que filtran o escriben por `tallerId`, si `req.user.rol === 'ADMIN'` (o EMPLEADO), **ignorar** el `tallerId` que venga en query/body y usar **solo** `req.user.tallerId`.
  - Opcional: si un ADMIN envía `tallerId` distinto al suyo, responder 403.

Esto se puede hacer en el **controller** (leyendo `req.user` y pasando `tallerId` al servicio) o en un **guard/interceptor** que inyecte el `tallerId` permitido.

### 3.2 SUPER_ADMIN puede dar rol ADMIN (solo para ese taller)

- **Objetivo**: Que solo SUPER_ADMIN pueda **cambiar el rol** de un usuario (por ejemplo a ADMIN) y que ese rol sea “ADMIN **de su taller**” (el usuario ya tiene un `tallerId` en la BD).
- **Cómo**: 
  - Endpoint tipo `PATCH /usuarios/:id/rol` (o incluir `rol` en el `PATCH /usuarios/:id` actual) protegido con `@Roles(Rol.SUPER_ADMIN)`.
  - Al actualizar, validar que el nuevo rol sea uno permitido (ej. ADMIN o EMPLEADO; si quieres, SUPER_ADMIN solo por otro SUPER_ADMIN o no permitirlo desde API).
  - El `tallerId` del usuario no lo cambia el “darle ADMIN”: el usuario ya pertenece a un taller; al ponerle rol ADMIN, pasa a ser “admin de ese taller”.

### 3.3 Pedir contraseña solo para “cambios mayores”

- **Objetivo**: Para las operaciones que tú elijas (cambiar rol, eliminar taller, etc.), exigir **además del JWT** que el usuario envíe su **contraseña actual**.
- **Cómo** (patrón que puedes reutilizar):
  - En el body del request añadir algo como: `{ "passwordConfirm": "contraseña actual" }`.
  - En el servicio de esa acción:
    1. Obtener el usuario (por `req.user.userId` o por email del token).
    2. Comprobar que `passwordConfirm` coincida con la contraseña guardada (usando el mismo criterio que en login, ej. bcrypt).
    3. Si no coincide → 403 o 401 con mensaje “Contraseña incorrecta”.
    4. Si coincide → ejecutar la acción (cambiar rol, eliminar taller, etc.).
  - Tú decides en qué endpoints exiges `passwordConfirm` (por ejemplo: cambiar rol de usuario, eliminar taller, eliminar cuenta, etc.).

---

## 4. Resumen de preguntas / decisiones

| Pregunta | Respuesta sugerida |
|----------|--------------------|
| ¿SUPER_ADMIN puede hacer todo, incluido dar ADMIN a un usuario de un taller? | Sí. Con un endpoint solo SUPER_ADMIN que permita actualizar el `rol` del usuario (y opcionalmente pedir contraseña para ese cambio). |
| ¿ADMIN solo gestiona su taller? | Sí. Restringir en backend que ADMIN (y EMPLEADO) solo usen `req.user.tallerId` al listar/crear/editar recursos. |
| ¿Pedir contraseña para cambios mayores? | Sí. Patrón: body con `passwordConfirm` + validación en servicio; tú eliges en qué operaciones lo exiges. |

---

## 5. Próximos pasos sugeridos (en orden)

1. **Restringir por taller para ADMIN (y EMPLEADO)**  
   En usuarios, empleados, clientes, servicio, trabajo, pagos, facturas, notificaciones: si `rol === ADMIN` o `EMPLEADO`, usar siempre `req.user.tallerId` y no permitir otro.

2. **Endpoint (o uso del PATCH usuarios) para que SUPER_ADMIN cambie el rol**  
   Protegido con `@Roles(Rol.SUPER_ADMIN)`. Si quieres “cambios mayores”, añadir en ese endpoint el body `passwordConfirm` y validarlo antes de cambiar el rol.

3. **Documentar qué operaciones exigen `passwordConfirm`**  
   Lista en este doc o en GUARDS-Y-ROLES: por ejemplo “cambiar rol de usuario”, “eliminar taller”, etc.

Cuando quieras, se puede bajar al código: por ejemplo primero “ADMIN solo su taller” en un módulo (ej. clientes o usuarios) y luego el endpoint de cambio de rol con o sin `passwordConfirm`.
