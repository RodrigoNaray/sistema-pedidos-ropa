import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';

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
}