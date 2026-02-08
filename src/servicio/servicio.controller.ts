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
  @ApiOperation({ summary: 'Crear un servicio (tallerId en el body)' })
  @ApiResponse({ status: 201, description: 'Servicio creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar servicios de un taller (tallerId obligatorio)' })
  @ApiQuery({ name: 'tallerId', required: true, description: 'UUID del taller' })
  @ApiQuery({ name: 'soloActivos', required: false, description: 'true = solo activos (default), false = todos' })
  @ApiResponse({ status: 200, description: 'Lista de servicios del taller' })
  findAll(
    @Query('tallerId') tallerId: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const solo = soloActivos === 'false' ? false : true;
    return this.servicioService.findAll(tallerId, solo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID (solo si pertenece al taller)' })
  @ApiQuery({ name: 'tallerId', required: true, description: 'UUID del taller' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  findOne(@Param('id') id: string, @Query('tallerId') tallerId: string) {
    return this.servicioService.findOne(id, tallerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un servicio (solo del taller indicado)' })
  @ApiQuery({ name: 'tallerId', required: true, description: 'UUID del taller' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  update(
    @Param('id') id: string,
    @Query('tallerId') tallerId: string,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.servicioService.update(id, updateServicioDto, tallerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un servicio (solo del taller indicado)' })
  @ApiQuery({ name: 'tallerId', required: true, description: 'UUID del taller' })
  @ApiResponse({ status: 200, description: 'Servicio desactivado (activo = false)' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  remove(@Param('id') id: string, @Query('tallerId') tallerId: string) {
    return this.servicioService.remove(id, tallerId);
  }
}
