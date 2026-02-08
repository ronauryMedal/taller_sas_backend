import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from './dto';
import { EmpleadosService } from './empleados.service';

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empleados (opcional: filtrar por taller)' })
  @ApiQuery({ name: 'tallerId', required: false, description: 'UUID del taller' })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  findAll(@Query('tallerId') tallerId?: string) {
    return this.empleadosService.findAll(tallerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un empleado (requiere tallerId)' })
  @ApiResponse({ status: 201, description: 'Empleado creado' })
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un empleado' })
  @ApiResponse({ status: 200, description: 'Empleado eliminado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
}
