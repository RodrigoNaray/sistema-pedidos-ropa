import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: CreateProductoDto) {
    const datosPrisma = this.mapearParaPrisma(data);
    const producto = await this.prisma.producto.create({ data: datosPrisma });
    return this.construirRespuesta(producto);
  }

  async listar(params?: { activo?: boolean | undefined; talle?: string | undefined; pagina?: number | undefined; tamano?: number | undefined }) {
    const { activo, talle, pagina = 1, tamano = 20 } = params ?? {};
    const where: Record<string, unknown> = {};
    if (activo !== undefined) where.activo = activo;
    if (talle) where.talle = talle;

    const [total, productos] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        skip: (pagina - 1) * tamano,
        take: tamano,
        orderBy: { creadoEn: 'desc' },
      }),
    ]);

    return { productos: productos.map(this.construirRespuesta), total, pagina, tamano };
  }

  async obtenerUno(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return this.construirRespuesta(producto);
  }

  async actualizar(id: string, data: UpdateProductoDto) {
    await this.prisma.producto.findUnique({ where: { id } }).catch(() => {
      throw new NotFoundException('Producto no encontrado');
    });
    const datosPrisma = this.mapearUpdateParaPrisma(data);
    const producto = await this.prisma.producto.update({ where: { id }, data: datosPrisma });
    return this.construirRespuesta(producto);
  }

  async eliminar(id: string) {
    await this.prisma.producto.findUnique({ where: { id } }).catch(() => {
      throw new NotFoundException('Producto no encontrado');
    });
    await this.prisma.producto.delete({ where: { id } });
    return { id, eliminado: true };
  }

  private mapearParaPrisma(data: CreateProductoDto) {
    return {
      nombre: data.nombre,
      talle: data.talle,
      precioCentavos: BigInt(data.precioCentavos),
      stock: data.stock,
      descripcion: data.descripcion ?? null,
      imagenes: data.imagenes ?? [],
      activo: data.activo ?? true,
    };
  }

  private mapearUpdateParaPrisma(data: UpdateProductoDto) {
    const datos: Record<string, unknown> = {};
    if (data.nombre !== undefined) datos.nombre = data.nombre;
    if (data.talle !== undefined) datos.talle = data.talle;
    if (data.precioCentavos !== undefined) datos.precioCentavos = BigInt(data.precioCentavos);
    if (data.stock !== undefined) datos.stock = data.stock;
    if (data.descripcion !== undefined) datos.descripcion = data.descripcion ?? null;
    if (data.imagenes !== undefined) datos.imagenes = data.imagenes;
    if (data.activo !== undefined) datos.activo = data.activo;
    return datos;
  }

  private construirRespuesta(p: {
    id: string;
    nombre: string;
    descripcion: string | null;
    talle: string;
    precioCentavos: bigint;
    stock: number;
    imagenes: string[];
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }): {
    id: string;
    nombre: string;
    descripcion: string | null;
    talle: string;
    precioCentavos: bigint;
    stock: number;
    imagenes: string[];
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  } {
    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      talle: p.talle,
      precioCentavos: p.precioCentavos,
      stock: p.stock,
      imagenes: p.imagenes,
      activo: p.activo,
      creadoEn: p.creadoEn,
      actualizadoEn: p.actualizadoEn,
    };
  }
}