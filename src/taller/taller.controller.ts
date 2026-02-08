import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTallerDto, UpdateTallerDto } from './dto';
import { TallerService } from './taller.service';

@ApiTags('taller')
@Controller('taller')
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los talleres' })
  @ApiResponse({ status: 200, description: 'Lista de talleres' })
  findAll() {
    return this.tallerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un taller por ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Taller encontrado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  findOne(@Param('id') id: string) {
    return this.tallerService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un taller (tabla raíz)' })
  @ApiResponse({ status: 201, description: 'Taller creado' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un taller' })
  @ApiResponse({ status: 200, description: 'Taller actualizado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateTallerDto: UpdateTallerDto,
  ) {
    return this.tallerService.update(id, updateTallerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un taller' })
  @ApiResponse({ status: 200, description: 'Taller eliminado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  remove(@Param('id') id: string) {
    return this.tallerService.remove(id);
  }
}
