import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';
import { ValidarCarritoInputDto } from './dto/validar-carrito-input.dto';

export interface CarritoItemResumen {
  productoId: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
}

export interface CarritoItemValidado extends CarritoItemResumen {
  stockDisponible: number;
  stockInsuficiente?: boolean;
}

export interface ValidarCarritoResult {
  items: CarritoItemValidado[];
  totalCentavos: number;
  hayStockInsuficiente: boolean;
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

    if (talle && !producto.tallas.includes(talle)) {
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

  async validarCarrito(itemsCarrito: ValidarCarritoInputDto['items']): Promise<ValidarCarritoResult> {
    const itemsValidados: CarritoItemValidado[] = [];
    let hayStockInsuficiente = false;

    for (const itemCarrito of itemsCarrito) {
      const producto = await this.prisma.producto.findFirst({
        where: {
          id: itemCarrito.productoId,
          activo: true,
        },
        select: {
          id: true,
          nombre: true,
          talle: true,
          precioCentavos: true,
          stock: true,
        },
      });

      if (!producto) {
        continue;
      }

      const precioBig = BigInt(producto.precioCentavos);
      const subtotalBig = precioBig * BigInt(itemCarrito.cantidad);
      const stockInsuficiente = itemCarrito.cantidad > producto.stock;

      if (stockInsuficiente) {
        hayStockInsuficiente = true;
      }

      const itemValidado: CarritoItemValidado = {
        productoId: producto.id,
        nombre: producto.nombre,
        talle: producto.talle,
        precioCentavos: Number(precioBig),
        cantidad: itemCarrito.cantidad,
        subtotalCentavos: Number(subtotalBig),
        stockDisponible: producto.stock,
        stockInsuficiente,
      };

      itemsValidados.push(itemValidado);
    }

    const totalBig = itemsValidados.reduce(
      (acc, item) => acc + BigInt(item.subtotalCentavos),
      BigInt(0),
    );

    return {
      items: itemsValidados,
      totalCentavos: Number(totalBig),
      hayStockInsuficiente,
    };
  }
}
