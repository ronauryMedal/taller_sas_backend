import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const hashPassword = (plain: string) => bcrypt.hashSync(plain, 10);
const PASS = hashPassword('123456');

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── 1. TALLERES (2) ─────────────────────────────────────────────────────
  const taller1 = await prisma.taller.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      nombre: 'Taller Mecánico Demo',
      rnc: '1-31-12345-6',
      telefono: '809-555-0000',
      email: 'contacto@tallerdemo.com',
      direccion: 'Av. Principal #100, Santo Domingo',
      activo: true,
    },
  });
  const taller2 = await prisma.taller.upsert({
    where: { id: '11111111-1111-1111-1111-111111111112' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111112',
      nombre: 'AutoServicio Norte',
      rnc: '1-31-54321-1',
      telefono: '809-555-2000',
      email: 'info@autoservicionorte.com',
      direccion: 'Calle Norte #50, Santiago',
      activo: true,
    },
  });
  console.log('  ✓ Talleres:', taller1.nombre, ',', taller2.nombre);

  // ─── 2. USUARIOS (1 SUPER_ADMIN + por taller: ADMIN y EMPLEADO) ───────────
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'superadmin@demo.com' },
    update: {},
    create: {
      tallerId: taller1.id,
      nombre: 'Super Administrador',
      email: 'superadmin@demo.com',
      password: PASS,
      rol: 'SUPER_ADMIN',
      activo: true,
    },
  });
  const admin1 = await prisma.usuario.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      tallerId: taller1.id,
      nombre: 'Admin Taller Demo',
      email: 'admin@demo.com',
      password: PASS,
      rol: 'ADMIN',
      activo: true,
    },
  });
  const empleado1User = await prisma.usuario.upsert({
    where: { email: 'empleado@demo.com' },
    update: {},
    create: {
      tallerId: taller1.id,
      nombre: 'Juan Empleado',
      email: 'empleado@demo.com',
      password: PASS,
      rol: 'EMPLEADO',
      activo: true,
    },
  });
  const admin2 = await prisma.usuario.upsert({
    where: { email: 'admin2@demo.com' },
    update: {},
    create: {
      tallerId: taller2.id,
      nombre: 'Admin AutoServicio',
      email: 'admin2@demo.com',
      password: PASS,
      rol: 'ADMIN',
      activo: true,
    },
  });
  const empleado2User = await prisma.usuario.upsert({
    where: { email: 'empleado2@demo.com' },
    update: {},
    create: {
      tallerId: taller2.id,
      nombre: 'Pedro Técnico',
      email: 'empleado2@demo.com',
      password: PASS,
      rol: 'EMPLEADO',
      activo: true,
    },
  });
  console.log('  ✓ Usuarios creados (superadmin, admin/empleado por taller)');

  // ─── 3. EMPLEADOS (2 por taller) ─────────────────────────────────────────
  const emp1a = await prisma.empleado.upsert({
    where: { id: '22222222-2222-2222-2222-222222222221' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222221',
      tallerId: taller1.id,
      usuarioId: empleado1User.id,
      nombre: 'Juan Empleado',
      telefono: '809-555-0001',
      porcentajeComision: 10,
      activo: true,
    },
  });
  const emp1b = await prisma.empleado.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      tallerId: taller1.id,
      nombre: 'María Técnica',
      telefono: '809-555-0002',
      porcentajeComision: 15,
      activo: true,
    },
  });
  const emp2a = await prisma.empleado.upsert({
    where: { id: '22222222-2222-2222-2222-222222222223' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222223',
      tallerId: taller2.id,
      usuarioId: empleado2User.id,
      nombre: 'Pedro Técnico',
      telefono: '809-555-2001',
      porcentajeComision: 12,
      activo: true,
    },
  });
  const emp2b = await prisma.empleado.upsert({
    where: { id: '22222222-2222-2222-2222-222222222224' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222224',
      tallerId: taller2.id,
      nombre: 'Laura Mecánica',
      telefono: '809-555-2002',
      porcentajeComision: 10,
      activo: true,
    },
  });
  console.log('  ✓ Empleados: 2 en Taller Demo, 2 en AutoServicio Norte');

  // ─── 4. CLIENTES (2 por taller) ───────────────────────────────────────────
  const cli1a = await prisma.cliente.upsert({
    where: { id: '33333333-3333-3333-3333-333333333331' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333331',
      tallerId: taller1.id,
      nombre: 'Carlos Rodríguez',
      telefono: '809-555-1000',
      email: 'carlos@empresa.com',
      empresa: 'Transportes Rodríguez',
      notas: 'Cliente preferencial',
    },
  });
  const cli1b = await prisma.cliente.upsert({
    where: { id: '33333333-3333-3333-3333-333333333332' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333332',
      tallerId: taller1.id,
      nombre: 'Ana Martínez',
      telefono: '809-555-1001',
      email: 'ana@mail.com',
    },
  });
  const cli2a = await prisma.cliente.upsert({
    where: { id: '33333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      tallerId: taller2.id,
      nombre: 'Luis Pérez',
      telefono: '809-555-3000',
      email: 'luis@mail.com',
      empresa: 'Flota Pérez',
    },
  });
  const cli2b = await prisma.cliente.upsert({
    where: { id: '33333333-3333-3333-3333-333333333334' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333334',
      tallerId: taller2.id,
      nombre: 'Rosa Díaz',
      telefono: '809-555-3001',
      email: 'rosa@mail.com',
    },
  });
  console.log('  ✓ Clientes: 2 por taller');

  // ─── 5. SERVICIOS (varios por taller) ─────────────────────────────────────
  const serv1a = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444441' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444441',
      tallerId: taller1.id,
      codigo: 'REC-CUL-01',
      nombre: 'Rectificación de culata',
      precio: 3500,
      descripcion: 'Rectificado de superficie de culata',
      activo: true,
    },
  });
  const serv1b = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444442' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444442',
      tallerId: taller1.id,
      codigo: 'CAM-ACE-01',
      nombre: 'Cambio de aceite',
      precio: 800,
      activo: true,
    },
  });
  const serv1c = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444443' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444443',
      tallerId: taller1.id,
      codigo: 'REP-FRE-01',
      nombre: 'Reparación de frenos',
      precio: 2500,
      activo: true,
    },
  });
  const serv2a = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444451' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444451',
      tallerId: taller2.id,
      codigo: 'ALI-CAR-01',
      nombre: 'Alineación y balanceo',
      precio: 1200,
      activo: true,
    },
  });
  const serv2b = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444452' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444452',
      tallerId: taller2.id,
      codigo: 'CAM-EMB-01',
      nombre: 'Cambio de embrague',
      precio: 4500,
      activo: true,
    },
  });
  const serv2c = await prisma.servicio.upsert({
    where: { id: '44444444-4444-4444-4444-444444444453' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444453',
      tallerId: taller2.id,
      codigo: 'REV-GEN-01',
      nombre: 'Revisión general',
      precio: 600,
      activo: true,
    },
  });
  console.log('  ✓ Servicios: 3 en Taller Demo, 3 en AutoServicio Norte');

  // ─── 6. TRABAJOS (al menos 2: uno por taller) ─────────────────────────────
  const trabajo1 = await prisma.trabajo.upsert({
    where: { id: '55555555-5555-5555-5555-555555555551' },
    update: {},
    create: {
      id: '55555555-5555-5555-5555-555555555551',
      tallerId: taller1.id,
      clienteId: cli1a.id,
      empleadoId: emp1a.id,
      codigoTrabajo: 'TR-2025-001',
      descripcionPieza: 'Motor 4 cilindros - reparación completa',
      estado: 'EN_PROCESO',
      observaciones: 'Pieza recibida el lunes',
    },
  });
  const trabajo2 = await prisma.trabajo.upsert({
    where: { id: '55555555-5555-5555-5555-555555555552' },
    update: {},
    create: {
      id: '55555555-5555-5555-5555-555555555552',
      tallerId: taller2.id,
      clienteId: cli2a.id,
      empleadoId: emp2a.id,
      codigoTrabajo: 'TR-2025-002',
      descripcionPieza: 'Vehículo sedan - alineación y revisión',
      estado: 'PENDIENTE',
      observaciones: 'Cliente solicita revisión antes de viaje',
    },
  });
  console.log('  ✓ Trabajos:', trabajo1.codigoTrabajo, ',', trabajo2.codigoTrabajo);

  // ─── 7. TrabajoServicio (líneas por trabajo) ───────────────────────────────
  await prisma.trabajoServicio.upsert({
    where: {
      trabajoId_servicioId: { trabajoId: trabajo1.id, servicioId: serv1a.id },
    },
    update: {},
    create: {
      trabajoId: trabajo1.id,
      servicioId: serv1a.id,
      cantidad: 1,
      precioUnitario: 3500,
      subtotal: 3500,
    },
  });
  await prisma.trabajoServicio.upsert({
    where: {
      trabajoId_servicioId: { trabajoId: trabajo1.id, servicioId: serv1b.id },
    },
    update: {},
    create: {
      trabajoId: trabajo1.id,
      servicioId: serv1b.id,
      cantidad: 1,
      precioUnitario: 800,
      subtotal: 800,
    },
  });
  await prisma.trabajoServicio.upsert({
    where: {
      trabajoId_servicioId: { trabajoId: trabajo2.id, servicioId: serv2a.id },
    },
    update: {},
    create: {
      trabajoId: trabajo2.id,
      servicioId: serv2a.id,
      cantidad: 1,
      precioUnitario: 1200,
      subtotal: 1200,
    },
  });
  await prisma.trabajoServicio.upsert({
    where: {
      trabajoId_servicioId: { trabajoId: trabajo2.id, servicioId: serv2c.id },
    },
    update: {},
    create: {
      trabajoId: trabajo2.id,
      servicioId: serv2c.id,
      cantidad: 1,
      precioUnitario: 600,
      subtotal: 600,
    },
  });
  console.log('  ✓ Líneas TrabajoServicio creadas');

  // ─── 8. Facturas (1 por trabajo) ─────────────────────────────────────────
  await prisma.factura.upsert({
    where: { id: '66666666-6666-6666-6666-666666666661' },
    update: {},
    create: {
      id: '66666666-6666-6666-6666-666666666661',
      trabajoId: trabajo1.id,
      tallerId: taller1.id,
      numeroFactura: 'F-2025-0001',
      subtotal: 4300,
      impuestos: 645,
      total: 4945,
      fechaEmision: new Date(),
    },
  });
  await prisma.factura.upsert({
    where: { id: '66666666-6666-6666-6666-666666666662' },
    update: {},
    create: {
      id: '66666666-6666-6666-6666-666666666662',
      trabajoId: trabajo2.id,
      tallerId: taller2.id,
      numeroFactura: 'F-2025-0002',
      subtotal: 1800,
      impuestos: 270,
      total: 2070,
      fechaEmision: new Date(),
    },
  });
  console.log('  ✓ Facturas creadas (1 por trabajo)');

  // ─── 9. Pagos ─────────────────────────────────────────────────────────────
  await prisma.pago.create({
    data: {
      trabajoId: trabajo1.id,
      monto: 2500,
      metodoPago: 'EFECTIVO',
      estado: 'COMPLETADO',
      fechaPago: new Date(),
    },
  });
  await prisma.pago.create({
    data: {
      trabajoId: trabajo2.id,
      monto: 1000,
      metodoPago: 'TRANSFERENCIA',
      estado: 'PENDIENTE',
      fechaPago: new Date(),
    },
  });
  console.log('  ✓ Pagos registrados');

  // ─── 10. Notificaciones ──────────────────────────────────────────────────
  await prisma.notificacion.create({
    data: {
      clienteId: cli1a.id,
      trabajoId: trabajo1.id,
      tipo: 'EMAIL',
      mensaje: 'Su trabajo TR-2025-001 está en proceso.',
      enviado: true,
    },
  });
  await prisma.notificacion.create({
    data: {
      clienteId: cli2a.id,
      trabajoId: trabajo2.id,
      tipo: 'WHATSAPP',
      mensaje: 'Trabajo TR-2025-002 registrado. Le avisamos cuando esté listo.',
      enviado: false,
    },
  });
  console.log('  ✓ Notificaciones creadas');

  console.log('\n✅ Seed completado.');
  console.log('\nCredenciales (contraseña: 123456):');
  console.log('  - superadmin@demo.com (SUPER_ADMIN)');
  console.log('  - admin@demo.com, empleado@demo.com → Taller Demo');
  console.log('  - admin2@demo.com, empleado2@demo.com → AutoServicio Norte');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
