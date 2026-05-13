import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/config/database/prisma.service';
import { PedidoService } from '../pedido.service';

describe('PedidoService - obtenerInstruccionesPago', () => {
  let service: PedidoService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pedido: {
      findUnique: jest.fn(),
    },
    configuracionTienda: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('flujo principal', () => {
    it('deberia retornar instrucciones completas cuando ConfiguracionTienda tiene todos los campos', async () => {
      const pedidoMock = {
        id: 'pedido-123',
        codigo: 'PED-ABC123',
        totalCentavos: BigInt(15000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco NA',
        cbu: '1234567890123456789012',
        alias: 'mi.tienda.pago',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Transferir el monto total',
        whatsappContacto: '+598991234567',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      const resultado = await service.obtenerInstruccionesPago('pedido-123');

      expect(resultado.banco).toBe('Banco NA');
      expect(resultado.cbu).toBe('1234567890123456789012');
      expect(resultado.alias).toBe('mi.tienda.pago');
      expect(resultado.titular).toBe('Tienda SA');
      expect(resultado.mensajeTransferencia).toBe('Transferir el monto total');
      expect(resultado.whatsappContacto).toBe('+598991234567');
      expect(resultado.numeroPedido).toBe('PED-ABC123');
      expect(resultado.estadoPedido).toBe('PENDIENTE_PAGO');
      expect(resultado.enlaceWhatsApp).toContain('https://wa.me/598991234567');
      expect(resultado.enlaceWhatsApp).toContain('PED-ABC123');
      expect(resultado.enlaceWhatsApp).toContain('comprobante');
    });

    it('deberia formatear el total correctamente', async () => {
      const pedidoMock = {
        id: 'pedido-456',
        codigo: 'PED-XYZ789',
        totalCentavos: BigInt(250000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco BB',
        cbu: '9876543210987654321098',
        alias: 'otro.alias',
        titular: 'Otro SL',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '598987654321',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      const resultado = await service.obtenerInstruccionesPago('pedido-456');

      expect(resultado.totalFormateado).toContain('2.500');
    });
  });

  describe('flujo alternativo - ConfiguracionTienda incompleta', () => {
    it('deberia lanzar BadRequestException cuando banco esta vacio', async () => {
      const pedidoMock = {
        id: 'pedido-789',
        codigo: 'PED-TEST1',
        totalCentavos: BigInt(10000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: '',
        cbu: '1234567890123456789012',
        alias: 'mi.alias',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '598991234567',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      await expect(service.obtenerInstruccionesPago('pedido-789')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.obtenerInstruccionesPago('pedido-789')).rejects.toThrow(
        'Datos de pago no disponibles',
      );
    });

    it('deberia lanzar BadRequestException cuando cbu esta vacio', async () => {
      const pedidoMock = {
        id: 'pedido-790',
        codigo: 'PED-TEST2',
        totalCentavos: BigInt(10000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco XX',
        cbu: '',
        alias: 'mi.alias',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '598991234567',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      await expect(service.obtenerInstruccionesPago('pedido-790')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deberia lanzar BadRequestException cuando alias esta vacio', async () => {
      const pedidoMock = {
        id: 'pedido-791',
        codigo: 'PED-TEST3',
        totalCentavos: BigInt(10000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco XX',
        cbu: '1234567890123456789012',
        alias: '',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '598991234567',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      await expect(service.obtenerInstruccionesPago('pedido-791')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deberia lanzar BadRequestException cuando titular esta vacio', async () => {
      const pedidoMock = {
        id: 'pedido-792',
        codigo: 'PED-TEST4',
        totalCentavos: BigInt(10000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco XX',
        cbu: '1234567890123456789012',
        alias: 'mi.alias',
        titular: '',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '598991234567',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      await expect(service.obtenerInstruccionesPago('pedido-792')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deberia lanzar BadRequestException cuando whatsappContacto esta vacio', async () => {
      const pedidoMock = {
        id: 'pedido-793',
        codigo: 'PED-TEST5',
        totalCentavos: BigInt(10000),
        estado: 'PENDIENTE_PAGO',
      };

      const configuracionMock = {
        id: 'global',
        banco: 'Banco XX',
        cbu: '1234567890123456789012',
        alias: 'mi.alias',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Mensaje',
        whatsappContacto: '',
      };

      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(pedidoMock);
      jest
        .spyOn(prisma.configuracionTienda, 'findUnique')
        .mockResolvedValue(configuracionMock);

      await expect(service.obtenerInstruccionesPago('pedido-793')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('flujo alternativo - Pedido no encontrado', () => {
    it('deberia lanzar NotFoundException cuando el pedido no existe', async () => {
      jest.spyOn(prisma.pedido, 'findUnique').mockResolvedValue(null);

      await expect(service.obtenerInstruccionesPago('pedido-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.obtenerInstruccionesPago('pedido-inexistente')).rejects.toThrow(
        'Pedido no encontrado',
      );

      expect(prisma.configuracionTienda.findUnique).not.toHaveBeenCalled();
    });
  });
});