import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/** Convierte Decimal o number a string con 2 decimales para mostrar en PDF */
function aNumero(val: unknown): string {
  if (val == null) return '0.00';
  const n = typeof val === 'object' && 'toString' in val ? Number((val as { toString(): string }).toString()) : Number(val);
  return Number.isNaN(n) ? '0.00' : n.toFixed(2);
}

/** Formato de fecha para la factura */
function aFecha(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Estructura de la factura tal como la devuelve findOneForPdf (para tipar el generador).
 * Compatible con el resultado de Prisma.
 */
export type FacturaParaPdf = {
  id: string;
  numeroFactura: string;
  subtotal: unknown;
  impuestos: unknown;
  total: unknown;
  fechaEmision: Date | string;
  taller: {
    nombre: string | null;
    rnc: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
  };
  trabajo: {
    codigoTrabajo: string;
    descripcionPieza: string;
    cliente: {
      nombre: string;
      telefono: string | null;
      email: string | null;
      empresa: string | null;
    } | null;
    serviciosEnTrabajo: Array<{
      cantidad: number;
      precioUnitario: unknown;
      subtotal: unknown;
      servicio: {
        codigo: string;
        nombre: string;
        precio: unknown;
      };
    }>;
  };
};

@Injectable()
export class FacturaPdfService {
  /**
   * Genera el PDF de la factura y lo devuelve como Buffer.
   * Debe recibir el objeto devuelto por FacturasService.findOneForPdf(id).
   */
  async generate(factura: FacturaParaPdf): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const t = factura.taller;
      const trabajo = factura.trabajo;
      const cliente = trabajo?.cliente;

      // ---- Encabezado: taller ----
      doc.fontSize(18).font('Helvetica-Bold').text('FACTURA', { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica');
      doc.text(t?.nombre ?? 'Taller', { continued: false });
      if (t?.rnc) doc.text(`RNC: ${t.rnc}`);
      if (t?.telefono) doc.text(`Tel: ${t.telefono}`);
      if (t?.email) doc.text(t.email);
      if (t?.direccion) doc.text(t.direccion);
      doc.moveDown(1.5);

      // ---- Número y fecha ----
      doc.font('Helvetica-Bold').text(`Nº ${factura.numeroFactura}`, { continued: true });
      doc.font('Helvetica').text(`   Fecha: ${aFecha(factura.fechaEmision)}`);
      doc.moveDown(1);

      // ---- Cliente ----
      doc.font('Helvetica-Bold').text('Cliente');
      doc.font('Helvetica');
      if (cliente) {
        doc.text(cliente.nombre);
        if (cliente.empresa) doc.text(cliente.empresa);
        if (cliente.telefono) doc.text(`Tel: ${cliente.telefono}`);
        if (cliente.email) doc.text(cliente.email);
      } else {
        doc.text('—');
      }
      doc.moveDown(1);

      // ---- Trabajo (pieza) ----
      doc.font('Helvetica-Bold').text('Trabajo / Pieza');
      doc.font('Helvetica');
      doc.text(`Código: ${trabajo?.codigoTrabajo ?? '—'}`);
      doc.text(`Descripción: ${trabajo?.descripcionPieza ?? '—'}`);
      doc.moveDown(1.5);

      // ---- Tabla de servicios ----
      const colCodigo = 50;
      const colDesc = 120;
      const colCant = 320;
      const colPrecio = 380;
      const colSubtotal = 460;
      const rowH = 18;

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Código', colCodigo, doc.y);
      doc.text('Descripción', colDesc, doc.y);
      doc.text('Cant.', colCant, doc.y);
      doc.text('P. Unit.', colPrecio, doc.y);
      doc.text('Subtotal', colSubtotal, doc.y);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(9);
      const lineas = trabajo?.serviciosEnTrabajo ?? [];
      for (const linea of lineas) {
        const yRow = doc.y;
        const serv = linea.servicio;
        const precioUnit = linea.precioUnitario != null ? aNumero(linea.precioUnitario) : aNumero(serv.precio);
        const subtotalLinea =
          linea.subtotal != null ? aNumero(linea.subtotal) : (Number(precioUnit) * linea.cantidad).toFixed(2);
        doc.text(serv.codigo ?? '—', colCodigo, yRow, { width: 65 });
        doc.text(serv.nombre ?? '—', colDesc, yRow, { width: 195 });
        doc.text(String(linea.cantidad), colCant, yRow, { width: 55 });
        doc.text(precioUnit, colPrecio, yRow, { width: 75 });
        doc.text(subtotalLinea, colSubtotal, yRow, { width: 85 });
        doc.y = yRow + rowH;
      }

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ---- Totales ----
      const sub = aNumero(factura.subtotal);
      const imp = aNumero(factura.impuestos);
      const tot = aNumero(factura.total);
      doc.font('Helvetica');
      let yT = doc.y;
      doc.text('Subtotal:', 380, yT);
      doc.text(sub, colSubtotal, yT, { width: 90, align: 'right' });
      yT += 16;
      doc.text('Impuestos:', 380, yT);
      doc.text(imp, colSubtotal, yT, { width: 90, align: 'right' });
      yT += 16;
      doc.font('Helvetica-Bold');
      doc.text('Total:', 380, yT);
      doc.text(tot, colSubtotal, yT, { width: 90, align: 'right' });

      doc.end();
    });
  }
}
