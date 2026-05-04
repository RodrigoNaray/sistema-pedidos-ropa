import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: CreatePedidoDto) {
    const { emailComprador, telefonoComprador, items } = data;

    const productosMap = new Map<string, bigint>();
    let totalCentavos = BigInt(0);

    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!producto) {
        throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      const precio = BigInt(producto.precioCentavos);
      totalCentavos += precio * BigInt(item.cantidad);
      productosMap.set(item.productoId, precio);
    }

    const codigo = this.generarCodigoReferencia();
    const ahora = new Date();
    const vencidoEn = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

    const pedido = await this.prisma.pedido.create({
      data: {
        emailComprador,
        telefonoComprador,
        totalCentavos,
        codigo,
        vencidoEn,
        estado: 'PENDIENTE_PAGO',
        items: {
          create: items.map((item) => {
            const precio = productosMap.get(item.productoId);
            if (!precio) {
              throw new NotFoundException(`Precio no encontrado para producto ${item.productoId}`);
            }
            return {
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitarioCentavos: precio,
              subtotalCentavos: precio * BigInt(item.cantidad),
            };
          }),
        },
      },
      include: { items: true },
    });

    await this.prisma.notificacion.create({
      data: {
        canal: 'EMAIL',
        mensaje: `Nuevo pedido ${codigo} recibido de ${emailComprador}`,
        pedidoId: pedido.id,
      },
    });

    return pedido;
  }

  async obtenerUno(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: { include: { producto: true } } },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return pedido;
  }

  async confirmarPago(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: { include: { producto: true } } },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.estado === 'PAGO_CONFIRMADO') {
      throw new Error('El pedido ya está confirmado');
    }

    for (const item of pedido.items) {
      await this.prisma.producto.update({
        where: { id: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    const actualizado = await this.prisma.pedido.update({
      where: { id },
      data: {
        estado: 'PAGO_CONFIRMADO',
        confirmadoEn: new Date(),
      },
      include: { items: { include: { producto: true } } },
    });

    await this.prisma.notificacion.create({
      data: {
        canal: 'EMAIL',
        mensaje: `Pedido ${pedido.codigo} confirmado`,
        pedidoId: pedido.id,
      },
    });

    return actualizado;
  }

  private generarCodigoReferencia(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codigo: string[] = [];

    for (let i = 0; i < 8; i++) {
      codigo.push(chars.charAt(Math.floor(Math.random() * chars.length)));
    }

    return `PED-${codigo.join('')}`;
  }
}