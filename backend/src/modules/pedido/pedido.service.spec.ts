import { Test, TestingModule } from '@nestjs/testing';
import { PedidoService } from './pedido.service';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidoService', () => {
  let service: PedidoService;
  let prisma: any;

  const mockProducto = {
    id: 'prod-1',
    nombre: 'Camiseta básica',
    talle: 'M',
    precioCentavos: BigInt(15000),
    stock: 10,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    imagenes: [],
  };

  const mockPedido = {
    id: 'pedido-1',
    codigo: 'PED-ABC123XY',
    emailComprador: 'comprador@email.com',
    telefonoComprador: '+59899123456',
    estado: 'PENDIENTE_PAGO',
    totalCentavos: BigInt(30000),
    creadoEn: new Date(),
    confirmadoEn: null,
    vencidoEn: new Date(Date.now() + 48 * 60 * 60 * 1000),
  };

  const mockPedidoWithItems = {
    ...mockPedido,
    items: [
      {
        id: 'item-1',
        pedidoId: 'pedido-1',
        productoId: 'prod-1',
        cantidad: 2,
        precioUnitarioCentavos: BigInt(15000),
        subtotalCentavos: BigInt(30000),
        producto: {
          nombre: 'Camiseta básica',
          talle: 'M',
        },
      },
    ],
  };

  const mockCreatePedidoDto: CreatePedidoDto = {
    emailComprador: 'comprador@email.com',
    telefonoComprador: '+59899123456',
    items: [
      {
        productoId: 'prod-1',
        cantidad: 2,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      pedido: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      notificacion: {
        create: jest.fn(),
      },
      producto: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      configuracionTienda: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
  });

  describe('crear', () => {
    it('debería crear un pedido exitosamente', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProducto);
      prisma.pedido.create.mockResolvedValue(mockPedidoWithItems as any);
      prisma.notificacion.create.mockResolvedValue({ id: 'notif-1' } as any);

      const result = await service.crear(mockCreatePedidoDto);

      expect(result.mensaje).toBe('Pedido creado exitosamente');
      expect(result.pedido).toBeDefined();
      expect(result.pedido.codigo).toBe('PED-ABC123XY');
      expect(result.pedido.totalCentavos).toBe(30000);
      expect(result.pedido.estado).toBe('PENDIENTE_PAGO');
      expect(result.pedido.items).toHaveLength(1);
      expect(result.pedido.items.at(0)?.cantidad).toBe(2);

      expect(prisma.pedido.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          emailComprador: 'comprador@email.com',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: BigInt(30000),
        }),
        include: expect.any(Object),
      });

      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensaje: expect.stringContaining('Nuevo pedido PED-'),
        }),
      });
    });

    it('debería crear un pedido con múltiples items', async () => {
      const producto2 = {
        ...mockProducto,
        id: 'prod-2',
        nombre: 'Pantalón recto',
        precioCentavos: BigInt(25000),
      };

      prisma.producto.findUnique
        .mockResolvedValueOnce(mockProducto)
        .mockResolvedValueOnce(producto2);

      const pedidoConDosItems = {
        ...mockPedidoWithItems,
        totalCentavos: BigInt(55000),
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: BigInt(15000),
            subtotalCentavos: BigInt(30000),
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
          {
            id: 'item-2',
            pedidoId: 'pedido-1',
            productoId: 'prod-2',
            cantidad: 1,
            precioUnitarioCentavos: BigInt(25000),
            subtotalCentavos: BigInt(25000),
            producto: { nombre: 'Pantalón recto', talle: 'L' },
          },
        ],
      };

      prisma.pedido.create.mockResolvedValue(pedidoConDosItems as any);
      prisma.notificacion.create.mockResolvedValue({ id: 'notif-1' } as any);

      const dtoMulti: CreatePedidoDto = {
        emailComprador: 'otro@email.com',
        telefonoComprador: '+59899111111',
        items: [
          { productoId: 'prod-1', cantidad: 2 },
          { productoId: 'prod-2', cantidad: 1 },
        ],
      };

      const result = await service.crear(dtoMulti);

      expect(result.pedido.totalCentavos).toBe(55000);
      expect(result.pedido.items).toHaveLength(2);
    });

    it('debería lanzar excepción cuando el email es inválido', async () => {
      await expect(
        service.crear({ ...mockCreatePedidoDto, emailComprador: 'email-invalido' }),
      ).rejects.toThrow(BadRequestException);

      await expect(service.crear({ ...mockCreatePedidoDto, emailComprador: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar excepción cuando el teléfono está vacío', async () => {
      await expect(service.crear({ ...mockCreatePedidoDto, telefonoComprador: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar excepción cuando el carrito está vacío', async () => {
      await expect(service.crear({ ...mockCreatePedidoDto, items: [] })).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException cuando un producto no existe', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.crear(mockCreatePedidoDto)).rejects.toThrow(NotFoundException);
      expect(prisma.producto.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        select: expect.objectContaining({
          id: true,
          nombre: true,
          talle: true,
          precioCentavos: true,
          stock: true,
        }),
      });
    });

    it('debería lanzar BadRequestException cuando el stock es insuficiente', async () => {
      const productoStockBajo = {
        ...mockProducto,
        stock: 1,
      };

      prisma.producto.findUnique.mockResolvedValue(productoStockBajo);

      await expect(
        service.crear({ ...mockCreatePedidoDto, items: [{ productoId: 'prod-1', cantidad: 5 }] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerUno', () => {
    it('debería retornar un pedido si existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(mockPedidoWithItems as any);

      const result = await service.obtenerUno('pedido-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('pedido-1');
      expect(result.codigo).toBe('PED-ABC123XY');
      expect(result.items).toHaveLength(1);
      expect(prisma.pedido.findUnique).toHaveBeenCalledWith({
        where: { id: 'pedido-1' },
        include: { items: { include: { producto: true } } },
      });
    });

    it('debería lanzar NotFoundException cuando el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.obtenerUno('pedido-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarPendientes', () => {
    it('debería retornar pedidos pendientes ordenados por fecha DESC', async () => {
      const mockPedidosPendientes = [
        {
          id: 'pedido-1',
          codigo: 'PED-AAA111',
          emailComprador: 'a@email.com',
          telefonoComprador: '+59899000000',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: BigInt(15000),
          creadoEn: new Date('2026-01-10'),
          vencidoEn: new Date('2026-01-12'),
          _count: { items: 1 },
        },
        {
          id: 'pedido-2',
          codigo: 'PED-BBB222',
          emailComprador: 'b@email.com',
          telefonoComprador: '+59899111111',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: BigInt(25000),
          creadoEn: new Date('2026-01-09'),
          vencidoEn: new Date('2026-01-11'),
          _count: { items: 2 },
        },
      ];

      prisma.pedido.findMany.mockResolvedValue(mockPedidosPendientes as any);

      const result = await service.listarPendientes();

      expect(result).toHaveLength(2);
      expect(result.at(0)!.codigo).toBe('PED-AAA111');
      expect(result.at(1)!.codigo).toBe('PED-BBB222');
      expect(result.at(0)!.itemsCount).toBe(1);
      expect(result.at(1)!.itemsCount).toBe(2);
      expect(result.at(0)!.totalCentavos).toBe(15000);
      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: { estado: 'PENDIENTE_PAGO' },
        orderBy: { creadoEn: 'desc' },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });
    });

    it('debería retornar array vacío cuando no hay pedidos pendientes', async () => {
      prisma.pedido.findMany.mockResolvedValue([]);

      const result = await service.listarPendientes();

      expect(result).toEqual([]);
    });
  });

  describe('confirmarPago', () => {
    it('debería confirmar el pago y descontar stock correctamente', async () => {
      const pedidoConfirmable = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: BigInt(15000),
            subtotalCentavos: BigInt(30000),
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const mockProductoTx = {
        id: 'prod-1',
        nombre: 'Camiseta básica',
        stock: 10,
      };

      const mockProductoUpdate = { nombre: 'Camiseta básica', stock: 8 };

      const mockTx = {
        pedido: {
          update: jest.fn().mockResolvedValue({ ...pedidoConfirmable, estado: 'PAGO_CONFIRMADO', confirmadoEn: new Date() }),
        },
        producto: {
          findUnique: jest.fn().mockResolvedValue(mockProductoTx),
          update: jest.fn().mockResolvedValue(mockProductoUpdate),
        },
        notificacion: {
          create: jest.fn().mockResolvedValue({ id: 'notif-2' }),
        },
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable as any);
      prisma.producto.findUnique.mockResolvedValue(mockProductoTx);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.confirmarPago('pedido-1');

      expect(result.estado).toBe('PAGO_CONFIRMADO');
      expect(result.confirmadoEn).toBeDefined();
      expect(mockTx.producto.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 2 } },
        select: { nombre: true, stock: true },
      });
      expect(mockTx.notificacion.create).toHaveBeenCalledTimes(2);
      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(1, {
        data: {
          canal: 'EMAIL',
          mensaje: 'Tu pedido PED-ABC123XY fue confirmado. Pago recibido exitosamente.',
          pedidoId: 'pedido-1',
        },
      });
      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(2, {
        data: {
          canal: 'PANEL',
          mensaje: 'Pago del pedido PED-ABC123XY confirmado por el administrador',
          pedidoId: 'pedido-1',
        },
      });
    });

    it('debería marcar producto inactivo cuando stock llega a cero', async () => {
      const pedidoConfirmable = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 10,
            precioUnitarioCentavos: BigInt(15000),
            subtotalCentavos: BigInt(150000),
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const mockProductoTx = {
        id: 'prod-1',
        nombre: 'Camiseta básica',
        stock: 10,
      };

      const mockTx = {
        pedido: {
          update: jest.fn().mockResolvedValue({ ...pedidoConfirmable, estado: 'PAGO_CONFIRMADO', confirmadoEn: new Date() }),
        },
        producto: {
          findUnique: jest.fn().mockResolvedValue(mockProductoTx),
          update: jest
            .fn()
            .mockResolvedValueOnce({ nombre: 'Camiseta básica', stock: 0 })
            .mockResolvedValueOnce({ nombre: 'Camiseta básica', activo: false }),
        },
        notificacion: {
          create: jest.fn().mockResolvedValue({ id: 'notif-2' }),
        },
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable as any);
      prisma.producto.findUnique.mockResolvedValue(mockProductoTx);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.confirmarPago('pedido-1');

      expect(result.estado).toBe('PAGO_CONFIRMADO');
      expect(mockTx.producto.update).toHaveBeenCalledTimes(2);
      expect(mockTx.producto.update).toHaveBeenLastCalledWith({
        where: { id: 'prod-1' },
        data: { activo: false },
      });
    });

    it('debería lanzar excepción cuando el pedido ya está confirmado', async () => {
      const yaConfirmado = {
        ...mockPedido,
        estado: 'PAGO_CONFIRMADO',
        confirmadoEn: new Date(),
        items: [],
      };

      prisma.pedido.findUnique.mockResolvedValue(yaConfirmado as any);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.confirmarPago('pedido-inexistente')).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando un producto no existe', async () => {
      const pedidoConfirmable = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-inexistente',
            cantidad: 2,
            precioUnitarioCentavos: BigInt(15000),
            subtotalCentavos: BigInt(30000),
            producto: { nombre: 'Camiseta no existe', talle: 'M' },
          },
        ],
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable as any);
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException cuando el stock es insuficiente', async () => {
      const pedidoConfirmable = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 15,
            precioUnitarioCentavos: BigInt(15000),
            subtotalCentavos: BigInt(225000),
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const productoStockBajo = {
        ...mockProducto,
        stock: 5,
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable as any);
      prisma.producto.findUnique.mockResolvedValue(productoStockBajo);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});