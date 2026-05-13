import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/config/database/prisma.service';
import { PedidoController } from '../pedido.controller';
import { PedidoService } from '../pedido.service';

describe('PedidoController - obtenerInstruccionesPago', () => {
  let controller: PedidoController;
  let service: PedidoService;

  const mockPrismaService = {
    pedido: { findUnique: jest.fn() },
    configuracionTienda: { findUnique: jest.fn() },
  };

  const mockPedidoService = {
    obtenerInstruccionesPago: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<PedidoController>(PedidoController);
    service = module.get<PedidoService>(PedidoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('flujo principal', () => {
    it('deberia retornar instrucciones de pago exitosamente', async () => {
      const instruccionesMock = {
        banco: 'Banco NA',
        cbu: '1234567890123456789012',
        alias: 'mi.tienda.pago',
        titular: 'Tienda SA',
        mensajeTransferencia: 'Transferir el monto total',
        whatsappContacto: '+598991234567',
        numeroPedido: 'PED-ABC123',
        totalFormateado: '$150,00',
        estadoPedido: 'PENDIENTE_PAGO',
        enlaceWhatsApp: 'https://wa.me/598991234567?text=hola',
      };

      jest.spyOn(service, 'obtenerInstruccionesPago').mockResolvedValue(instruccionesMock);

      const resultado = await controller.obtenerInstruccionesPago('pedido-123');

      expect(resultado).toEqual(instruccionesMock);
      expect(service.obtenerInstruccionesPago).toHaveBeenCalledWith('pedido-123');
    });
  });

  describe('flujo alternativo - Pedido no encontrado', () => {
    it('deberia propagar NotFoundException cuando el pedido no existe', async () => {
      jest
        .spyOn(service, 'obtenerInstruccionesPago')
        .mockRejectedValue(new NotFoundException('Pedido no encontrado'));

      await expect(controller.obtenerInstruccionesPago('pedido-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('flujo alternativo - Datos de pago no disponibles', () => {
    it('deberia propagar BadRequestException cuando la configuracion esta incompleta', async () => {
      jest
        .spyOn(service, 'obtenerInstruccionesPago')
        .mockRejectedValue(new BadRequestException('Datos de pago no disponibles'));

      await expect(controller.obtenerInstruccionesPago('pedido-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});