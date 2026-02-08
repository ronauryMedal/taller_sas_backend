import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Rol } from '../auth/roles.enum';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear un taller (solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Taller creado' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Actualizar un taller (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Taller actualizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateTallerDto: UpdateTallerDto,
  ) {
    return this.tallerService.update(id, updateTallerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @ApiOperation({ summary: 'Eliminar un taller (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Taller eliminado' })
  @ApiResponse({ status: 403, description: 'Sin permiso' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  remove(@Param('id') id: string) {
    return this.tallerService.remove(id);
  }
}
