import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { NotificacionService } from './notificacion.service';

describe('NotificacionService', () => {
  let service: NotificacionService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      notificacion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as PrismaService;

    service = new NotificacionService(prisma);
  });

  describe('listar', () => {
    it('debe retornar todas las notificaciones cuando filtro es all', async () => {
      const mockNotificaciones = [
        { id: '1', canal: 'PANEL', mensaje: 'Test 1', leida: false, creadoEn: new Date(), pedidoId: null },
        { id: '2', canal: 'EMAIL', mensaje: 'Test 2', leida: true, creadoEn: new Date(), pedidoId: 'ped-1' },
      ];

      (prisma.notificacion.findMany as jest.Mock).mockResolvedValue(mockNotificaciones);

      const result = await service.listar({ filtro: 'all' });

      expect(result).toEqual(mockNotificaciones);
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { creadoEn: 'desc' },
      });
    });

    it('debe retornar solo las no leidas cuando filtro es unread', async () => {
      const mockNotificaciones = [
        { id: '1', canal: 'PANEL', mensaje: 'Test', leida: false, creadoEn: new Date(), pedidoId: null },
      ];

      (prisma.notificacion.findMany as jest.Mock).mockResolvedValue(mockNotificaciones);

      const result = await service.listar({ filtro: 'unread' });

      expect(result).toEqual(mockNotificaciones);
      expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
        where: { leida: false },
        orderBy: { creadoEn: 'desc' },
      });
    });

    it('debe retornar todas las notificaciones cuando no se pasa filtro', async () => {
      const mockNotificaciones = [
        { id: '1', canal: 'PANEL', mensaje: 'Test', leida: false, creadoEn: new Date(), pedidoId: null },
      ];

      (prisma.notificacion.findMany as jest.Mock).mockResolvedValue(mockNotificaciones);

      const result = await service.listar({});

      expect(result).toEqual(mockNotificaciones);
    });
  });

  describe('obtenerDetalle', () => {
    it('debe retornar la notificacion con su pedido asociado', async () => {
      const mockNotificacion = {
        id: 'notif-1',
        canal: 'PANEL',
        mensaje: 'Nuevo pedido',
        leida: false,
        creadoEn: new Date(),
        pedidoId: 'ped-1',
      };

      const mockPedido = {
        id: 'ped-1',
        emailComprador: 'cliente@ejemplo.com',
        telefonoComprador: '+598987654321',
        estado: 'PENDIENTE_PAGO',
        totalCentavos: 5000,
        codigo: 'PEDIDO-001',
        creadoEn: new Date(),
        confirmadoEn: null,
        vencidoEn: new Date(),
      };

      (prisma.notificacion.findUnique as jest.Mock).mockResolvedValue({
        ...mockNotificacion,
        pedido: mockPedido,
      });

      const result = await service.obtenerDetalle('notif-1');

      expect(result).toEqual({
        notificacion: {
          ...mockNotificacion,
          pedido: mockPedido,
        },
        pedido: mockPedido,
      });
    });

    it('debe lanzar NotFoundException cuando la notificacion no existe', async () => {
      (prisma.notificacion.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.obtenerDetalle('notif-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('marcarComoLeida', () => {
    it('debe marcar la notificacion como leida y retornarla', async () => {
      const mockNotificacion = {
        id: 'notif-1',
        leida: false,
        creadoEn: new Date(),
      };

      const mockUpdated = {
        id: 'notif-1',
        leida: true,
        creadoEn: new Date(),
      };

      (prisma.notificacion.findUnique as jest.Mock).mockResolvedValue(mockNotificacion);
      (prisma.notificacion.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await service.marcarComoLeida('notif-1');

      expect(result).toEqual(mockUpdated);
      expect(prisma.notificacion.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { leida: true },
        select: { id: true, leida: true, creadoEn: true },
      });
    });

    it('debe retornar la notificacion sin actualizar si ya esta leida', async () => {
      const mockNotificacion = {
        id: 'notif-1',
        leida: true,
        creadoEn: new Date(),
      };

      (prisma.notificacion.findUnique as jest.Mock).mockResolvedValue(mockNotificacion);

      const result = await service.marcarComoLeida('notif-1');

      expect(result).toEqual(mockNotificacion);
      expect(prisma.notificacion.update).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando la notificacion no existe', async () => {
      (prisma.notificacion.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.marcarComoLeida('notif-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});