import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServicioService } from './servicio.service';
import { CreateServicioDto, UpdateServicioDto } from './dto';

@ApiTags('servicio')
@Controller('servicio')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un servicio' })
  @ApiResponse({ status: 201, description: 'Servicio creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar servicios (opcional: por taller, solo activos)' })
  @ApiQuery({ name: 'tallerId', required: false, description: 'UUID del taller' })
  @ApiQuery({ name: 'soloActivos', required: false, description: 'true = solo activos (default), false = todos' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const solo = soloActivos === 'false' ? false : true;
    return this.servicioService.findAll(tallerId, solo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  findOne(@Param('id') id: string) {
    return this.servicioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.servicioService.update(id, updateServicioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un servicio (soft delete)' })
  @ApiResponse({ status: 200, description: 'Servicio desactivado (activo = false)' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  remove(@Param('id') id: string) {
    return this.servicioService.remove(id);
  }
}
