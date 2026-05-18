import { Body, Controller, Get, HttpCode, HttpStatus, Param, Put, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PedidoService, CreatePedidoResult } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';
import { PedidoPendienteDto } from './dto/pedido-pendiente.dto';

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


@Put(':id/confirmar-pago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pago manualmente de un pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido ya confirmado o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido o producto no encontrado',
  })
  async confirmarPago(@Param('id') id: string) {
    return this.pedidoService.confirmarPago(id);
  }

@Get('list-pendientes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar pedidos pendientes de pago' })
  @ApiResponse({
    status: 200,
    description: 'Pedidos pendientes obtenidos',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/PedidoPendienteDto' },
    },
  })
  async listarPendientes(): Promise<PedidoPendienteDto[]> {
    return this.pedidoService.listarPendientes();
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
