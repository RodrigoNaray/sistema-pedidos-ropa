import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { PrismaService } from '@common/config/database/prisma.service';

describe('CarritoService', () => {
  let service: CarritoService;
  let prisma: PrismaService;

  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarritoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CarritoService>(CarritoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('agregarAlCarrito', () => {
    const dtoValido = {
      productoId: 'prod123',
      cantidad: 2,
      talle: 'M',
    };

    const productoExistente = {
      id: 'prod123',
      nombre: 'Camiseta',
      precioCentavos: 1000,
      stock: 10,
      talle: 'M',
      tallas: ['S', 'M', 'L'],
      activo: true,
      imagenes: [],
      categoriaId: 'cat1',
      marca: 'MarcaA',
      descripcion: 'Descripcion',
      creadoA: new Date(),
      actualizadoA: new Date(),
    };

    beforeEach(() => {
      mockPrisma.producto.findUnique.mockResolvedValue(productoExistente);
    });

    it('debe agregar un producto al carrito exitosamente', async () => {
      const result = await service.agregarAlCarrito(dtoValido);

      expect(result).toHaveProperty('mensaje', 'Producto agregado al carrito');
      expect(result.carrito).toHaveLength(1);
      expect(result.carrito[0].productoId).toBe('prod123');
      expect(result.carrito[0].cantidad).toBe(2);
      expect(result.carrito[0].subtotalCentavos).toBe(2000);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.agregarAlCarrito(dtoValido)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const productoSinStock = { ...productoExistente, stock: 1 };
      mockPrisma.producto.findUnique.mockResolvedValue(productoSinStock);

      await expect(service.agregarAlCarrito(dtoValido)).rejects.toThrow(BadRequestException);
      await expect(service.agregarAlCarrito(dtoValido)).rejects.toThrow('Stock insuficiente');
    });

    it('debe lanzar BadRequestException si el talle no esta disponible', async () => {
      const productoSinTalle = { ...productoExistente, tallas: ['S', 'L'] };
      mockPrisma.producto.findUnique.mockResolvedValue(productoSinTalle);

      await expect(service.agregarAlCarrito(dtoValido)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la cantidad es menor o igual a cero', async () => {
      await expect(
        service.agregarAlCarrito({ ...dtoValido, cantidad: 0 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.agregarAlCarrito({ ...dtoValido, cantidad: -1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe funcionar sin talle especificado', async () => {
      const dtoSinTalle = { productoId: 'prod123', cantidad: 1 };

      const result = await service.agregarAlCarrito(dtoSinTalle);

      expect(result.carrito[0].cantidad).toBe(1);
    });
  });
});
