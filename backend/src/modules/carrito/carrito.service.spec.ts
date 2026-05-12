import { Test, TestingModule } from '@nestjs/testing';
import { CarritoService } from './carrito.service';
import { PrismaService } from '@common/config/database/prisma.service';
import { ValidarCarritoInputDto } from './dto/validar-carrito-input.dto';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';
import { ActualizarCarritoDto } from './dto/actualizar-carrito.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CarritoService', () => {
  let service: CarritoService;
  let prisma: any;

  const productoMock = {
    id: 'prod-1',
    nombre: 'Camiseta basica',
    talle: 'M',
    precioCentavos: BigInt(15000),
    stock: 10,
    activo: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      producto: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarritoService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CarritoService>(CarritoService);
  });

  describe('validarCarrito', () => {
    it('debe validar correctamente los items del carrito', async () => {
      prisma.producto.findFirst.mockResolvedValue(productoMock);

      const itemsCarrito: ValidarCarritoInputDto['items'] = [
        {
          productoId: 'prod-1',
          nombre: 'Camiseta basica',
          talle: 'M',
          precioCentavos: 15000,
          cantidad: 2,
          subtotalCentavos: 30000,
        },
      ];

      const resultado = await service.validarCarrito(itemsCarrito);

      expect(prisma.producto.findFirst).toHaveBeenCalledWith({
        where: { id: 'prod-1', activo: true },
        select: { id: true, nombre: true, talle: true, precioCentavos: true, stock: true },
      });
      expect(resultado.items).toHaveLength(1);
      const primerItem = resultado.items.at(0)!;
      expect(primerItem.productoId).toBe('prod-1');
      expect(primerItem.precioCentavos).toBe(15000);
      expect(primerItem.cantidad).toBe(2);
      expect(primerItem.subtotalCentavos).toBe(30000);
      expect(primerItem.stockDisponible).toBe(10);
      expect(primerItem.stockInsuficiente).toBe(false);
      expect(resultado.totalCentavos).toBe(30000);
      expect(resultado.hayStockInsuficiente).toBe(false);
    });

    it('debe marcar stockInsuficiente cuando la cantidad supera el stock disponible', async () => {
      const productoPocoStock = { ...productoMock, stock: 1 };

      prisma.producto.findFirst.mockResolvedValue(productoPocoStock);

      const itemsCarrito: ValidarCarritoInputDto['items'] = [
        {
          productoId: 'prod-1',
          nombre: 'Camiseta basica',
          talle: 'M',
          precioCentavos: 15000,
          cantidad: 2,
          subtotalCentavos: 30000,
        },
      ];

      const resultado = await service.validarCarrito(itemsCarrito);

      expect(resultado.items.at(0)!.stockInsuficiente).toBe(true);
      expect(resultado.hayStockInsuficiente).toBe(true);
    });

    it('debe excluir productos que no existen o estan inactivos', async () => {
      const itemsConProductoInexistente: ValidarCarritoInputDto['items'] = [
        {
          productoId: 'prod-1',
          nombre: 'Camiseta basica',
          talle: 'M',
          precioCentavos: 15000,
          cantidad: 2,
          subtotalCentavos: 30000,
        },
        {
          productoId: 'prod-inexistente',
          nombre: 'Producto inexistente',
          talle: 'S',
          precioCentavos: 10000,
          cantidad: 1,
          subtotalCentavos: 10000,
        },
      ];

      prisma.producto.findFirst.mockImplementation(async ({ where }: { where: { id: string } }) => {
        const id = where.id;
        if (id === 'prod-1') return productoMock;
        return null;
      });

      const resultado = await service.validarCarrito(itemsConProductoInexistente);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.items.at(0)!.productoId).toBe('prod-1');
      expect(resultado.totalCentavos).toBe(30000);
    });

    it('debe devolver items vacios cuando el array de entrada esta vacio', async () => {
      const resultado = await service.validarCarrito([]);

      expect(resultado.items).toHaveLength(0);
      expect(resultado.totalCentavos).toBe(0);
      expect(resultado.hayStockInsuficiente).toBe(false);
    });

    it('debe calcular correctamente el total con multiple items', async () => {
      const itemsMultiples: ValidarCarritoInputDto['items'] = [
        {
          productoId: 'prod-1',
          nombre: 'Camiseta basica',
          talle: 'M',
          precioCentavos: 15000,
          cantidad: 2,
          subtotalCentavos: 30000,
        },
        {
          productoId: 'prod-2',
          nombre: 'Pantalon deportivo',
          talle: 'L',
          precioCentavos: 25000,
          cantidad: 1,
          subtotalCentavos: 25000,
        },
      ];

      prisma.producto.findFirst.mockImplementation(async ({ where }: { where: { id: string } }) => {
        const id = where.id;
        if (id === 'prod-1') return { ...productoMock, precioCentavos: BigInt(15000) };
        return { ...productoMock, id: 'prod-2', nombre: 'Pantalon deportivo', precioCentavos: BigInt(25000) };
      });

      const resultado = await service.validarCarrito(itemsMultiples);

      expect(resultado.items).toHaveLength(2);
      expect(resultado.totalCentavos).toBe(55000);
    });
  });

  describe('actualizarCantidad', () => {
    it('debe devolver el resumen validado al actualizar cantidad', async () => {
      prisma.producto.findUnique.mockResolvedValue({
        id: 'prod-1',
        nombre: 'Camiseta basica',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 10,
      });

      const dto: ActualizarCarritoDto = { cantidad: 3 };
      const resultado = await service.actualizarCantidad('prod-1', 'M', dto);

      expect(resultado.productoId).toBe('prod-1');
      expect(resultado.nombre).toBe('Camiseta basica');
      expect(resultado.talle).toBe('M');
      expect(resultado.precioCentavos).toBe(15000);
      expect(resultado.cantidad).toBe(3);
      expect(resultado.subtotalCentavos).toBe(45000);
    });

    it('debe lanzar BadRequestException cuando el talle no coincide', async () => {
      prisma.producto.findUnique.mockResolvedValue({
        id: 'prod-1',
        nombre: 'Camiseta basica',
        talle: 'S',
        precioCentavos: BigInt(15000),
        stock: 10,
      });

      const dto: ActualizarCarritoDto = { cantidad: 1 };
      await expect(service.actualizarCantidad('prod-1', 'M', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('eliminarDelCarrito', () => {
    it('debe ejecutar sin error al eliminar un producto', async () => {
      prisma.producto.findUnique.mockResolvedValue({
        id: 'prod-1',
        nombre: 'Camiseta basica',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 10,
      });

      await expect(service.eliminarDelCarrito('prod-1')).resolves.toBeUndefined();
    });
  });
});
