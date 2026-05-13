import { ApiProperty } from '@nestjs/swagger';

export class PedidoInstruccionesPagoDto {
  @ApiProperty({ description: 'Nombre del banco destino' })
  banco!: string;

  @ApiProperty({ description: 'CBU de la cuenta' })
  cbu!: string;

  @ApiProperty({ description: 'Alias de la cuenta' })
  alias!: string;

  @ApiProperty({ description: 'Titular de la cuenta' })
  titular!: string;

  @ApiProperty({ description: 'Mensaje de la transferencia' })
  mensajeTransferencia!: string;

  @ApiProperty({ description: 'Número de WhatsApp de contacto' })
  whatsappContacto!: string;

  @ApiProperty({ description: 'Número de pedido para referencia' })
  numeroPedido!: string;

  @ApiProperty({ description: 'Total formateado en pesos' })
  totalFormateado!: string;

  @ApiProperty({ description: 'Estado actual del pedido' })
  estadoPedido!: string;

  @ApiProperty({ description: 'Enlace directo para enviar comprobante por WhatsApp' })
  enlaceWhatsApp!: string;
}
