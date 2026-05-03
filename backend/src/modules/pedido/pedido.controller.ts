import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  async crear(@Body() data: CreatePedidoDto) {
    return this.pedidoService.crear(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  async obtenerUno(@Param('id') id: string) {
    return this.pedidoService.obtenerUno(id);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar pago de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Pago confirmado' })
  async confirmarPago(@Param('id') id: string) {
    return this.pedidoService.confirmarPago(id);
  }
}