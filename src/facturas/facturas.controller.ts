import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FacturasService } from './facturas.service';
import { FacturaPdfService } from './factura-pdf.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@ApiTags('facturas')
@Controller('facturas')
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly facturaPdfService: FacturaPdfService,
  ) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Descargar factura en PDF' })
  @ApiResponse({ status: 200, description: 'PDF de la factura (application/pdf)' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getPdf(@Param('id') id: string): Promise<StreamableFile> {
    const factura = await this.facturasService.findOneForPdf(id);
    const buffer = await this.facturaPdfService.generate(factura);
    const filename = `factura-${factura.numeroFactura}.pdf`;
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturasService.remove(id);
  }
}
