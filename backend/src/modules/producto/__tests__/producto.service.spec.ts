import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from '../producto.service';
import { PrismaService } from '@common/config/database/prisma.service';

describe('ProductoService', () => {
  let service: ProductoService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    producto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    prisma = mockPrismaService as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('deberia crear un producto exitosamente', async () => {
      const dto = {
        nombre: 'Remera Algodón',
        talle: 'M',
        precioCentavos: 15000,
        stock: 100,
        descripcion: 'Remera de algodón 100%',
        imagenes: ['https://example.com/image.jpg'],
        activo: true,
      };

      const productoCreado = {
        id: 'prod-1',
        ...dto,
        precioCentavos: BigInt(dto.precioCentavos),
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.create.mockResolvedValue(productoCreado);

      const result = await service.crear(dto);

      expect(prisma.producto.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: 'prod-1',
        nombre: dto.nombre,
        talle: dto.talle,
        precioCentavos: expect.any(BigInt),
        stock: dto.stock,
        descripcion: dto.descripcion,
        imagenes: dto.imagenes,
        activo: dto.activo,
        creadoEn: expect.any(Date),
        actualizadoEn: expect.any(Date),
      });
    });
  });

  describe('listar', () => {
    it('deberia listar todos los productos activos sin filtros', async () => {
      const productosMock = [
        {
          id: 'prod-1',
          nombre: 'Remera Algodón',
          talle: 'M',
          precioCentavos: BigInt(15000),
          stock: 100,
          descripcion: 'Descripción 1',
          imagenes: ['https://example.com/1.jpg'],
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
        {
          id: 'prod-2',
          nombre: 'Pantalón Chino',
          talle: 'L',
          precioCentavos: BigInt(35000),
          stock: 50,
          descripcion: 'Descripción 2',
          imagenes: ['https://example.com/2.jpg'],
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      prisma.producto.count.mockResolvedValue(2);
      prisma.producto.findMany.mockResolvedValue(productosMock);

      const result = await service.listar({ activo: true });

      expect(prisma.producto.count).toHaveBeenCalledTimes(1);
      expect(prisma.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { activo: true },
          skip: 0,
          take: 20,
          orderBy: { creadoEn: 'desc' },
        }),
      );
      expect(result.productos).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pagina).toBe(1);
      expect(result.tamano).toBe(20);
    });

    it('deberia listar productos con paginacion personalizada', async () => {
      prisma.producto.count.mockResolvedValue(50);
      prisma.producto.findMany.mockResolvedValue([]);

      await service.listar({ pagina: 2, tamano: 10 });

      expect(prisma.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('deberia listar productos filtrados por talle', async () => {
      prisma.producto.count.mockResolvedValue(5);
      prisma.producto.findMany.mockResolvedValue([]);

      await service.listar({ activo: true, talle: 'M' });

      expect(prisma.producto.count).toHaveBeenCalledWith({
        where: { activo: true, talle: 'M' },
      });
    });
  });

  describe('obtenerUno', () => {
    it('deberia obtener un producto por ID', async () => {
      const productoMock = {
        id: 'prod-1',
        nombre: 'Remera Algodón',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 100,
        descripcion: 'Descripción',
        imagenes: ['https://example.com/1.jpg'],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoMock);

      const result = await service.obtenerUno('prod-1');

      expect(prisma.producto.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
      expect(result.id).toBe('prod-1');
    });

    it('deberia lanzar NotFoundException si el producto no existe', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.obtenerUno('prod-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('deberia actualizar un producto exitosamente', async () => {
      const productoExistente = {
        id: 'prod-1',
        nombre: 'Remera Antigua',
        talle: 'M',
        precioCentavos: BigInt(10000),
        stock: 50,
        descripcion: 'Antigua',
        imagenes: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const productoActualizado = {
        ...productoExistente,
        nombre: 'Remera Actualizada',
        precioCentavos: BigInt(12000),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoExistente);
      prisma.producto.update.mockResolvedValue(productoActualizado);

      const result = await service.actualizar('prod-1', {
        nombre: 'Remera Actualizada',
        precioCentavos: 12000,
      });

      expect(prisma.producto.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
        }),
      );
      expect(result.nombre).toBe('Remera Actualizada');
    });

    it('deberia lanzar NotFoundException si el producto no existe al actualizar', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.actualizar('prod-inexistente', { nombre: 'Nuevo' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminar', () => {
    it('deberia eliminar un producto exitosamente', async () => {
      const productoExistente = {
        id: 'prod-1',
        nombre: 'Remera',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 100,
        descripcion: null,
        imagenes: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoExistente);
      prisma.producto.delete.mockResolvedValue(productoExistente);

      const result = await service.eliminar('prod-1');

      expect(prisma.producto.delete).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
      expect(result.eliminado).toBe(true);
    });

    it('deberia lanzar NotFoundException si el producto no existe al eliminar', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.eliminar('prod-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});