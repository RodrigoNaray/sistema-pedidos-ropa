import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PedidoService, CreatePedidoResult } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error de validación (email inválido, teléfono vacío, stock insuficiente, carrito vacío)',
  })
  async crear(@Body() dto: CreatePedidoDto): Promise<{ mensaje: string; pedido: CreatePedidoResult }> {
    return this.pedidoService.crear(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  async obtenerUno(id: string) {
    return this.pedidoService.obtenerUno(id);
  }

  @Post(':id/confirmar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pago de un pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido ya confirmado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  async confirmarPago(id: string) {
    return this.pedidoService.confirmarPago(id);
  }

  @Get(':id/instrucciones-pago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener instrucciones de pago para un pedido' })
  @ApiResponse({
    status: 200,
    description: 'Instrucciones de pago obtenidas',
    type: PedidoInstruccionesPagoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  @ApiResponse({
    status: 503,
    description: 'Datos de pago no disponibles',
  })
  async obtenerInstruccionesPago(@Param('id') pedidoId: string): Promise<PedidoInstruccionesPagoDto> {
    return this.pedidoService.obtenerInstruccionesPago(pedidoId);
  }
}
