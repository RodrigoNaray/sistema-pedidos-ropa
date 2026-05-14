import type { PedidoInstruccionesPagoDto } from '@/types/pedido-instrucciones';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class InstruccionesService {
  static async obtenerInstruccionesPago(pedidoId: string): Promise<PedidoInstruccionesPagoDto> {
    const response = await fetch(`${BASE_URL}/pedidos/${pedidoId}/instrucciones-pago`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pedido no encontrado');
      }
      throw new Error('Datos de pago no disponibles');
    }

    return response.json();
  }
}