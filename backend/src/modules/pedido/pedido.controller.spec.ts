import { Test, TestingModule } from '@nestjs/testing';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidoController', () => {
  let controller: PedidoController;
  let service: any;

  const mockPedidoService = {
    crear: jest.fn(),
    obtenerUno: jest.fn(),
    listarPendientes: jest.fn(),
    confirmarPago: jest.fn(),
    obtenerInstruccionesPago: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [
        {
          provide: PedidoService,
          useValue: mockPedidoService,
        },
      ],
    }).compile();

    controller = module.get<PedidoController>(PedidoController);
  });

  describe('crear', () => {
    it('debería delegar al servicio y retornar el resultado', async () => {
      const dto: CreatePedidoDto = {
        emailComprador: 'comprador@email.com',
        telefonoComprador: '+59899123456',
        items: [{ productoId: 'prod-1', cantidad: 2 }],
      };

      const mockResult = {
        mensaje: 'Pedido creado exitosamente',
        pedido: {
          id: 'pedido-1',
          codigo: 'PED-ABC123XY',
          emailComprador: 'comprador@email.com',
          telefonoComprador: '+59899123456',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: 30000,
          items: [
            {
              id: 'item-1',
              productoId: 'prod-1',
              cantidad: 2,
              precioUnitarioCentavos: 15000,
              subtotalCentavos: 30000,
              producto: { nombre: 'Camiseta básica', talle: 'M' },
            },
          ],
          creadoEn: new Date(),
          vencidoEn: new Date(),
        },
      };

      mockPedidoService.crear.mockResolvedValue(mockResult);

      const result = await controller.crear(dto);

      expect(result).toEqual(mockResult);
      expect(mockPedidoService.crear).toHaveBeenCalledWith(dto);
    });
  });

  describe('obtenerUno', () => {
    it('debería delegar al servicio y retornar el pedido', async () => {
      const mockPedido = {
        id: 'pedido-1',
        codigo: 'PED-ABC123XY',
        emailComprador: 'comprador@email.com',
        telefonoComprador: '+59899123456',
        estado: 'PENDIENTE_PAGO',
        totalCentavos: 30000,
        creadoEn: new Date(),
        confirmadoEn: null,
        vencidoEn: new Date(),
        items: [
          {
            id: 'item-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 30000,
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      mockPedidoService.obtenerUno.mockResolvedValue(mockPedido);

      const result = await controller.obtenerUno('pedido-1');

      expect(result).toEqual(mockPedido);
      expect(mockPedidoService.obtenerUno).toHaveBeenCalledWith('pedido-1');
    });

    it('debería propagar NotFoundException del servicio', async () => {
      mockPedidoService.obtenerUno.mockRejectedValue(new NotFoundException('Pedido no encontrado'));

      await expect(controller.obtenerUno('pedido-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarPendientes', () => {
    it('debería delegar al servicio y retornar los pedidos pendientes', async () => {
      const mockPedidos = [
        {
          id: 'pedido-1',
          codigo: 'PED-AAA111',
          emailComprador: 'a@email.com',
          telefonoComprador: '+59899000000',
          totalCentavos: 15000,
          creadoEn: new Date('2026-01-10'),
          vencidoEn: new Date('2026-01-12'),
          itemsCount: 1,
        },
      ];

      mockPedidoService.listarPendientes.mockResolvedValue(mockPedidos);

      const result = await controller.listarPendientes();

      expect(result).toEqual(mockPedidos);
      expect(mockPedidoService.listarPendientes).toHaveBeenCalled();
    });
  });

  describe('confirmarPago', () => {
    it('debería delegar al servicio y retornar el resultado', async () => {
      const mockResult = {
        id: 'pedido-1',
        codigo: 'PED-ABC123XY',
        estado: 'PAGO_CONFIRMADO',
        confirmadoEn: new Date(),
        totalCentavos: 30000,
      };

      mockPedidoService.confirmarPago.mockResolvedValue(mockResult);

      const result = await controller.confirmarPago('pedido-1');

      expect(result).toEqual(mockResult);
      expect(mockPedidoService.confirmarPago).toHaveBeenCalledWith('pedido-1');
    });

    it('debería propagar BadRequestException del servicio', async () => {
      mockPedidoService.confirmarPago.mockRejectedValue(new BadRequestException('Este pedido ya fue confirmado'));

      await expect(controller.confirmarPago('pedido-1')).rejects.toThrow(BadRequestException);
    });

    it('debería propagar NotFoundException del servicio', async () => {
      mockPedidoService.confirmarPago.mockRejectedValue(new NotFoundException('Pedido no encontrado'));

      await expect(controller.confirmarPago('pedido-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerInstruccionesPago', () => {
    it('debería delegar al servicio y retornar las instrucciones', async () => {
      const mockInstrucciones: PedidoInstruccionesPagoDto = {
        banco: 'Banco Ejemplo',
        cbu: '0000001234567890123456',
        alias: 'mi.alias.pago',
        titular: 'Juan Perez',
        mensajeTransferencia: 'Referencia: PED-ABC123XY',
        whatsappContacto: '+59899111111',
        numeroPedido: 'PED-ABC123XY',
        totalFormateado: '$1.500,00',
        estadoPedido: 'PENDIENTE_PAGO',
        enlaceWhatsApp: 'https://wa.me/59899111111?text=Hola!',
      };

      mockPedidoService.obtenerInstruccionesPago.mockResolvedValue(mockInstrucciones);

      const result = await controller.obtenerInstruccionesPago('pedido-1');

      expect(result).toEqual(mockInstrucciones);
      expect(mockPedidoService.obtenerInstruccionesPago).toHaveBeenCalledWith('pedido-1');
    });

    it('debería propagar NotFoundException del servicio', async () => {
      mockPedidoService.obtenerInstruccionesPago.mockRejectedValue(new NotFoundException('Pedido no encontrado'));

      await expect(controller.obtenerInstruccionesPago('pedido-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});