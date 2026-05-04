import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@ApiTags('productos')
@ApiBearerAuth()
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @UseGuards()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  async crear(@Body() data: CreateProductoDto) {
    return this.productoService.crear(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos del catálogo' })
  async listar(
    @Query('activo') activo?: boolean,
    @Query('talle') talle?: string,
    @Query('pagina') pagina?: number,
    @Query('tamano') tamano?: number,
  ) {
    const filtros: { activo?: boolean; talle?: string; pagina?: number; tamano?: number } = {};
    if (activo !== undefined) filtros.activo = activo;
    if (talle !== undefined) filtros.talle = talle;
    if (pagina !== undefined) filtros.pagina = pagina;
    if (tamano !== undefined) filtros.tamano = tamano;
    return this.productoService.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  async obtenerUno(@Param('id') id: string) {
    return this.productoService.obtenerUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  async actualizar(@Param('id') id: string, @Body() data: UpdateProductoDto) {
    return this.productoService.actualizar(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  async eliminar(@Param('id') id: string) {
    return this.productoService.eliminar(id);
  }
}