import { Controller, Post, Body, Patch, Delete, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';
import { ValidarCarritoResponseDto } from './dto/validar-carrito.dto';
import { ValidarCarritoInputDto } from './dto/validar-carrito-input.dto';
import { ActualizarCarritoDto } from './dto/actualizar-carrito.dto';

@ApiTags('carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post('agregar')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiResponse({ status: 200, description: 'Producto agregado al carrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validacion' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async agregarAlCarrito(@Body() dto: AgregarCarritoDto) {
    return this.carritoService.agregarAlCarrito(dto);
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar items del carrito' })
  @ApiResponse({ status: 200, description: 'Items del carrito validados exitosamente', type: ValidarCarritoResponseDto })
  @ApiResponse({ status: 400, description: 'Error de validacion' })
  async validarCarrito(@Body() dto: ValidarCarritoInputDto) {
    const result = await this.carritoService.validarCarrito(dto.items);
    return result;
  }

  @Patch('items/:productoId')
  @ApiOperation({ summary: 'Actualizar cantidad de un producto en el carrito' })
  @ApiResponse({ status: 200, description: 'Cantidad actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validacion' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async actualizarCantidad(
    @Param('productoId') productoId: string,
    @Body() dto: ActualizarCarritoDto,
  ) {
    if (!productoId) {
      throw new BadRequestException('El ID del producto es obligatorio');
    }
    return this.carritoService.actualizarCantidad(productoId, '' as string, dto);
  }

  @Delete('items/:productoId')
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  @ApiResponse({ status: 200, description: 'Producto eliminado del carrito exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async eliminarDelCarrito(@Param('productoId') productoId: string) {
    if (!productoId) {
      throw new BadRequestException('El ID del producto es obligatorio');
    }
    return this.carritoService.eliminarDelCarrito(productoId);
  }
}
