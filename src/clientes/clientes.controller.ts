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
import { CreateClienteDto, UpdateClienteDto } from './dto';
import { ClientesService } from './clientes.service';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes (opcional: filtrar por taller)' })
  @ApiQuery({ name: 'tallerId', required: false, description: 'UUID del taller' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll(@Query('tallerId') tallerId?: string) {
    return this.clientesService.findAll(tallerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un cliente (requiere tallerId)' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
