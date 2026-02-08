/*
  Warnings:

  - Added the required column `tallerId` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Trabajo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "tallerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "fechaPago" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "TrabajoServicio" (
    "id" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TrabajoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrabajoServicio_trabajoId_idx" ON "TrabajoServicio"("trabajoId");

-- CreateIndex
CREATE INDEX "TrabajoServicio_servicioId_idx" ON "TrabajoServicio"("servicioId");

-- CreateIndex
CREATE INDEX "TrabajoServicio_deletedAt_idx" ON "TrabajoServicio"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrabajoServicio_trabajoId_servicioId_key" ON "TrabajoServicio"("trabajoId", "servicioId");

-- CreateIndex
CREATE INDEX "Factura_trabajoId_idx" ON "Factura"("trabajoId");

-- CreateIndex
CREATE INDEX "Factura_tallerId_idx" ON "Factura"("tallerId");

-- CreateIndex
CREATE INDEX "Pago_trabajoId_idx" ON "Pago"("trabajoId");

-- CreateIndex
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");

-- CreateIndex
CREATE INDEX "Pago_metodoPago_idx" ON "Pago"("metodoPago");

-- CreateIndex
CREATE INDEX "Pago_deletedAt_idx" ON "Pago"("deletedAt");

-- CreateIndex
CREATE INDEX "Trabajo_tallerId_idx" ON "Trabajo"("tallerId");

-- CreateIndex
CREATE INDEX "Trabajo_clienteId_idx" ON "Trabajo"("clienteId");

-- CreateIndex
CREATE INDEX "Trabajo_empleadoId_idx" ON "Trabajo"("empleadoId");

-- CreateIndex
CREATE INDEX "Trabajo_estado_idx" ON "Trabajo"("estado");

-- AddForeignKey
ALTER TABLE "TrabajoServicio" ADD CONSTRAINT "TrabajoServicio_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoServicio" ADD CONSTRAINT "TrabajoServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "Taller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
