import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';
import { PedidoPendienteDto } from './dto/pedido-pendiente.dto';

export interface StockInsuficienteError {
  productoId: string;
  nombre: string;
  talle: string;
  pedido: number;
  disponible: number;
}

export interface CreatePedidoResult {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  estado: string;
  totalCentavos: number;
  items: PedidoItemResumen[];
  creadoEn: Date;
  vencidoEn: Date;
}

export interface PedidoItemResumen {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitarioCentavos: number;
  subtotalCentavos: number;
  producto: {
    nombre: string;
    talle: string;
  };
}

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly estadoPendientePago = 'PENDIENTE_PAGO' as const;
  private static readonly estadoPagoConfirmado = 'PAGO_CONFIRMADO' as const;
  private static readonly estadoCancelado = 'CANCELADO' as const;

  private static readonly canalEmail = 'EMAIL' as const;
  private static readonly canalPanel = 'PANEL' as const;

  async crear(
    data: CreatePedidoDto,
  ): Promise<{ mensaje: string; pedido: CreatePedidoResult }> {
    const emailValido = PedidoService.validarEmail(data.emailComprador);
    if (!emailValido) {
      throw new BadRequestException('El email no tiene un formato válido');
    }

    if (!data.telefonoComprador || data.telefonoComprador.trim() === '') {
      throw new BadRequestException('El teléfono es obligatorio');
    }

    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const productosMap = new Map<
      string,
      {
        id: string;
        nombre: string;
        talle: string;
        precioCentavos: bigint;
        stock: number;
      }
    >();

    const stockInsuficientes: StockInsuficienteError[] = [];

    for (const item of data.items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
        select: {
          id: true,
          nombre: true,
          talle: true,
          precioCentavos: true,
          stock: true,
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${item.productoId} no encontrado`,
        );
      }

      if (producto.stock < item.cantidad) {
        stockInsuficientes.push({
          productoId: producto.id,
          nombre: producto.nombre,
          talle: producto.talle,
          pedido: item.cantidad,
          disponible: producto.stock,
        });
        continue;
      }

      productosMap.set(item.productoId, {
        id: producto.id,
        nombre: producto.nombre,
        talle: producto.talle,
        precioCentavos: producto.precioCentavos,
        stock: producto.stock,
      });
    }

    if (stockInsuficientes.length > 0) {
      const productosAfectados = stockInsuficientes
        .map(
          (s) =>
            `${s.nombre} (talle: ${s.talle}, pedido: ${s.pedido}, disponible: ${s.disponible})`,
        )
        .join('; ');

      throw new BadRequestException(
        `Stock insuficiente: ${productosAfectados}`,
      );
    }

    const codigo = this.generarCodigoReferencia();
    const ahora = new Date();
    const vencidoEn = new Date(
      ahora.getTime() + this.obtenerVencimientoHoras() * 60 * 60 * 1000,
    );

    let totalCentavosBig = BigInt(0);

    const itemsData = data.items.map((item) => {
      const producto = productosMap.get(item.productoId);
      if (!producto) {
        throw new NotFoundException(
          `Producto ${item.productoId} no encontrado`,
        );
      }

      const subtotal = BigInt(producto.precioCentavos) * BigInt(item.cantidad);
      totalCentavosBig += subtotal;

      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioCentavos: producto.precioCentavos,
        subtotalCentavos: subtotal,
      };
    });

    const pedido = await this.prisma.pedido.create({
      data: {
        emailComprador: data.emailComprador.trim(),
        telefonoComprador: data.telefonoComprador.trim(),
        totalCentavos: totalCentavosBig,
        codigo,
        vencidoEn,
        estado: PedidoService.estadoPendientePago,
        items: {
          create: itemsData,
        },
      },
      include: { items: { include: { producto: true } } },
    });

    await this.prisma.notificacion.create({
      data: {
        canal: PedidoService.canalPanel,
        mensaje: `Nuevo pedido ${codigo} recibido de ${pedido.emailComprador}`,
        pedidoId: pedido.id,
      },
    });

    const pedidoResultado: CreatePedidoResult = {
      id: pedido.id,
      codigo: pedido.codigo,
      emailComprador: pedido.emailComprador,
      telefonoComprador: pedido.telefonoComprador,
      estado: pedido.estado,
      totalCentavos: Number(pedido.totalCentavos),
      items: pedido.items.map((i: {
        id: string;
        productoId: string;
        cantidad: number;
        precioUnitarioCentavos: bigint;
        subtotalCentavos: bigint;
        producto: { nombre: string; talle: string };
      }) => ({
        id: i.id,
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitarioCentavos: Number(i.precioUnitarioCentavos),
        subtotalCentavos: Number(i.subtotalCentavos),
        producto: {
          nombre: i.producto.nombre,
          talle: i.producto.talle,
        },
      })),
      creadoEn: pedido.creadoEn,
      vencidoEn: pedido.vencidoEn,
    };

    return {
      mensaje: 'Pedido creado exitosamente',
      pedido: pedidoResultado,
    };
  }

  async obtenerUno(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: { include: { producto: true } } },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return {
      id: pedido.id,
      codigo: pedido.codigo,
      emailComprador: pedido.emailComprador,
      telefonoComprador: pedido.telefonoComprador,
      estado: pedido.estado,
      totalCentavos: Number(pedido.totalCentavos),
      creadoEn: pedido.creadoEn,
      confirmadoEn: pedido.confirmadoEn,
      vencidoEn: pedido.vencidoEn,
      items: pedido.items.map((i: {
        id: string;
        productoId: string;
        cantidad: number;
        precioUnitarioCentavos: bigint;
        subtotalCentavos: bigint;
        producto: { nombre: string; talle: string };
      }) => ({
        id: i.id,
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitarioCentavos: Number(i.precioUnitarioCentavos),
        subtotalCentavos: Number(i.subtotalCentavos),
        producto: {
          nombre: i.producto.nombre,
          talle: i.producto.talle,
        },
      })),
    };
  }

  async listarPendientes(): Promise<PedidoPendienteDto[]> {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: PedidoService.estadoPendientePago,
      },
      orderBy: { creadoEn: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return pedidos.map(
      (p: {
        id: string;
        codigo: string;
        emailComprador: string;
        telefonoComprador: string;
        totalCentavos: bigint;
        creadoEn: Date;
        vencidoEn: Date;
        _count: { items: number };
      }) => ({
        id: p.id,
        codigo: p.codigo,
        emailComprador: p.emailComprador,
        telefonoComprador: p.telefonoComprador,
        totalCentavos: Number(p.totalCentavos),
        creadoEn: p.creadoEn,
        vencidoEn: p.vencidoEn,
        itemsCount: p._count.items,
      }),
    );
  }

  async confirmarPago(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: { include: { producto: true } } },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.estado === PedidoService.estadoPagoConfirmado) {
      throw new BadRequestException('Este pedido ya fue confirmado');
    }

    const productosInsuficientes: string[] = [];
    const productosNoEncontrados: string[] = [];

    for (const item of pedido.items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
        select: { id: true, nombre: true, stock: true },
      });

      if (!producto) {
        productosNoEncontrados.push(item.productoId);
        continue;
      }

      if (producto.stock < item.cantidad) {
        productosInsuficientes.push(
          `${producto.nombre} (pedido: ${item.cantidad}, disponible: ${producto.stock})`,
        );
      }
    }

    if (productosNoEncontrados.length > 0) {
      const lista = productosNoEncontrados.join(', ');
      throw new NotFoundException(`Producto no encontrado: ${lista}`);
    }

    if (productosInsuficientes.length > 0) {
      const lista = productosInsuficientes.join(', ');
      throw new BadRequestException(
        `Stock insuficiente: ${lista}`,
      );
    }

    const resultado = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.pedido.update({
        where: { id },
        data: {
          estado: PedidoService.estadoPagoConfirmado,
          confirmadoEn: new Date(),
        },
      });

      const productosActualizados: string[] = [];

      for (const item of pedido.items) {
        const productoActualizado = await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
          select: { nombre: true, stock: true },
        });

        if (productoActualizado.stock <= 0) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { activo: false },
          });
          productosActualizados.push(productoActualizado.nombre);
        }
      }

      await tx.notificacion.create({
        data: {
          canal: PedidoService.canalEmail,
          mensaje: `Tu pedido ${pedido.codigo} fue confirmado. Pago recibido exitosamente.`,
          pedidoId: pedido.id,
        },
      });

      await tx.notificacion.create({
        data: {
          canal: PedidoService.canalPanel,
          mensaje: `Pago del pedido ${pedido.codigo} confirmado por el administrador`,
          pedidoId: pedido.id,
        },
      });

      return {
        id: pedido.id,
        codigo: pedido.codigo,
        estado: PedidoService.estadoPagoConfirmado,
        confirmadoEn: new Date(),
        totalCentavos: Number(pedido.totalCentavos),
      };
    });

    return resultado;
  }

  async obtenerInstruccionesPago(pedidoId: string): Promise<PedidoInstruccionesPagoDto> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const configuracion = await this.prisma.configuracionTienda.findUnique({
      where: { id: 'global' },
    });

    if (!configuracion) {
      throw new BadRequestException('Datos de pago no disponibles');
    }

    const camposRequeridos = [
      { campo: 'banco', valor: configuracion.banco },
      { campo: 'cbu', valor: configuracion.cbu },
      { campo: 'alias', valor: configuracion.alias },
      { campo: 'titular', valor: configuracion.titular },
      { campo: 'whatsappContacto', valor: configuracion.whatsappContacto },
    ] as const;

    const camposVacios = camposRequeridos.filter(
      (c) => !c.valor || c.valor.trim() === '',
    );

    if (camposVacios.length > 0) {
      throw new BadRequestException('Datos de pago no disponibles');
    }

    const whatsappNumeros = configuracion.whatsappContacto.replace(
      /[^0-9]/g,
      '',
    );
    const mensajeReferencia = encodeURIComponent(
      `Hola! Quiero enviar el comprobante de transferencia del pedido ${pedido.codigo}.`,
    );
    const enlaceWhatsApp = `https://wa.me/${whatsappNumeros}?text=${mensajeReferencia}`;

    const totalFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(Number(pedido.totalCentavos) / 100);

    const resultado: PedidoInstruccionesPagoDto = {
      banco: configuracion.banco,
      cbu: configuracion.cbu,
      alias: configuracion.alias,
      titular: configuracion.titular,
      mensajeTransferencia: configuracion.mensajeTransferencia,
      whatsappContacto: configuracion.whatsappContacto,
      numeroPedido: pedido.codigo,
      totalFormateado,
      estadoPedido: pedido.estado,
      enlaceWhatsApp,
    };

    return resultado;
  }

  private static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generarCodigoReferencia(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codigo: string[] = [];

    for (let i = 0; i < 8; i++) {
      codigo.push(chars.charAt(Math.floor(Math.random() * chars.length)));
    }

    return `PED-${codigo.join('')}`;
  }

  private obtenerVencimientoHoras(): number {
    return 48;
  }
}