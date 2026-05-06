import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';

export interface CarritoItemResumen {
  productoId: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
}

@Injectable()
export class CarritoService {
  constructor(private readonly prisma: PrismaService) {}

  async agregarAlCarrito(dto: AgregarCarritoDto): Promise<{ mensaje: string; carrito: CarritoItemResumen[] }> {
    const { productoId, cantidad, talle } = dto;

    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    if (cantidad > producto.stock) {
      throw new BadRequestException('Stock insuficiente');
    }

    if (talle && producto.talle !== talle) {
      throw new BadRequestException('El talle seleccionado no corresponde con el producto');
    }

    const precioBig = BigInt(producto.precioCentavos);
    const subtotalBig = precioBig * BigInt(cantidad);

    const itemResumen: CarritoItemResumen = {
      productoId: producto.id,
      nombre: producto.nombre,
      talle: producto.talle,
      precioCentavos: Number(precioBig),
      cantidad,
      subtotalCentavos: Number(subtotalBig),
    };

    return {
      mensaje: 'Producto agregado al carrito',
      carrito: [itemResumen],
    };
  }
}
