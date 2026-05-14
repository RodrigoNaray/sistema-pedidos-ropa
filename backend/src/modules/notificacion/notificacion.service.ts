import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { ListarNotificacionesDto } from './dto/listar-notificaciones.dto';

export interface NotificacionDetalle {
  notificacion: {
    id: string;
    canal: string;
    mensaje: string;
    leida: boolean;
    creadoEn: Date;
    pedidoId: string | null;
  };
  pedido:
    | {
        id: string;
        emailComprador: string;
        telefonoComprador: string;
        estado: string;
        totalCentavos: number;
        codigo: string;
        creadoEn: Date;
        confirmadoEn: Date | null;
        vencidoEn: Date;
      }
    | null;
}

@Injectable()
export class NotificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarNotificacionesDto): Promise<
    Array<{
      id: string;
      canal: string;
      mensaje: string;
      leida: boolean;
      creadoEn: Date;
      pedidoId: string | null;
    }>
  > {
    const condicion =
      filtros.filtro === 'unread'
        ? { leida: false }
        : undefined;

    return this.prisma.notificacion.findMany({
      where: condicion,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerDetalle(id: string): Promise<NotificacionDetalle> {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
      include: { pedido: true },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return {
      notificacion,
      pedido: notificacion.pedido,
    };
  }

  async marcarComoLeida(id: string): Promise<{
    id: string;
    leida: boolean;
    creadoEn: Date;
  }> {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.leida) {
      return notificacion;
    }

    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
      select: { id: true, leida: true, creadoEn: true },
    });
  }
}