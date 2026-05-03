import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: CreateProductoDto) {
    const producto = await this.prisma.producto.create({ data });
    return this.construirRespuesta(producto);
  }

  async listar(params?: { activo?: boolean; talle?: string; pagina?: number; tamano?: number }) {
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
    const producto = await this.prisma.producto.update({ where: { id }, data });
    return this.construirRespuesta(producto);
  }

  async eliminar(id: string) {
    await this.prisma.producto.findUnique({ where: { id } }).catch(() => {
      throw new NotFoundException('Producto no encontrado');
    });
    await this.prisma.producto.delete({ where: { id } });
    return { id, eliminado: true };
  }

  private construirRespuesta(p: any) {
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