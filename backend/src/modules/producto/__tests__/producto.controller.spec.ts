import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from '../producto.controller';
import { ProductoService } from '../producto.service';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: jest.Mocked<Pick<ProductoService, 'crear' | 'listar' | 'obtenerUno' | 'actualizar' | 'eliminar'>>;

  const mockService = {
    crear: jest.fn(),
    listar: jest.fn(),
    obtenerUno: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
    service = mockService as jest.Mocked<Pick<ProductoService, 'crear' | 'listar' | 'obtenerUno' | 'actualizar' | 'eliminar'>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('deberia delegar la creacion al servicio', async () => {
      const dto: CreateProductoDto = {
        nombre: 'Remera Algodón',
        talle: 'M',
        precioCentavos: 15000,
        stock: 100,
      };

      const productoCreado = {
        id: 'prod-1',
        ...dto,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      service.crear.mockResolvedValue(productoCreado);

      const result = await controller.crear(dto);

      expect(service.crear).toHaveBeenCalledWith(dto);
      expect(result).toBe(productoCreado);
    });
  });

  describe('listar', () => {
    it('deberia delegar la listadon al servicio con filtros', async () => {
      const productosMock = [
        {
          id: 'prod-1',
          nombre: 'Remera Algodón',
          talle: 'M',
          precioCentavos: BigInt(15000),
          stock: 100,
          imagenes: ['https://example.com/1.jpg'],
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      service.listar.mockResolvedValue({
        productos: productosMock,
        total: 1,
        pagina: 1,
        tamano: 20,
      });

      const result = await controller.listar('true', 'M', 1, 20);

      expect(service.listar).toHaveBeenCalledWith({
        activo: true,
        talle: 'M',
        pagina: 1,
        tamano: 20,
      });
      expect(result.productos).toHaveLength(1);
    });

    it('deberia listar sin filtros cuando no se proporcionan parametros', async () => {
      service.listar.mockResolvedValue({
        productos: [],
        total: 0,
        pagina: 1,
        tamano: 20,
      });

      await controller.listar(undefined, undefined, undefined, undefined);

      expect(service.listar).toHaveBeenCalledWith({});
    });
  });

  describe('obtenerUno', () => {
    it('deberia delegar la obtencion al servicio', async () => {
      const productoMock = {
        id: 'prod-1',
        nombre: 'Remera Algodón',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 100,
        imagenes: ['https://example.com/1.jpg'],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      service.obtenerUno.mockResolvedValue(productoMock);

      const result = await controller.obtenerUno('prod-1');

      expect(service.obtenerUno).toHaveBeenCalledWith('prod-1');
      expect(result.id).toBe('prod-1');
    });

    it('deberia propagar el NotFoundException del servicio', async () => {
      service.obtenerUno.mockRejectedValue(new NotFoundException('Producto no encontrado'));

      await expect(controller.obtenerUno('prod-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('deberia delegar la actualizacion al servicio', async () => {
      const updateDto: UpdateProductoDto = { nombre: 'Remera Actualizada' };
      const productoActualizado = {
        id: 'prod-1',
        nombre: 'Remera Actualizada',
        talle: 'M',
        precioCentavos: BigInt(15000),
        stock: 100,
        imagenes: ['https://example.com/1.jpg'],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      service.actualizar.mockResolvedValue(productoActualizado);

      const result = await controller.actualizar('prod-1', updateDto);

      expect(service.actualizar).toHaveBeenCalledWith('prod-1', updateDto);
      expect(result.nombre).toBe('Remera Actualizada');
    });
  });

  describe('eliminar', () => {
    it('deberia delegar la eliminacion al servicio', async () => {
      const resultado = { id: 'prod-1', eliminado: true };

      service.eliminar.mockResolvedValue(resultado);

      const result = await controller.eliminar('prod-1');

      expect(service.eliminar).toHaveBeenCalledWith('prod-1');
      expect(result.eliminado).toBe(true);
    });
  });
});