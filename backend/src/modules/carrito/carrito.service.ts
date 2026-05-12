import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { AgregarCarritoDto } from './dto/agregar-al-carrito.dto';
import { ValidarCarritoInputDto } from './dto/validar-carrito-input.dto';
import { ActualizarCarritoDto } from './dto/actualizar-carrito.dto';

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

  private calcularSubtotal(precioUnitarioCentavos: number, cantidad: number): number {
    const precioBig = BigInt(precioUnitarioCentavos);
    const subtotalBig = precioBig * BigInt(cantidad);
    return Number(subtotalBig);
  }

  async obtenerProductoPorId(productoId: string): Promise<{
    id: string;
    nombre: string;
    talle: string;
    precioCentavos: bigint;
    stock: number;
  }> {
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
      select: {
        id: true,
        nombre: true,
        talle: true,
        precioCentavos: true,
        stock: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    return producto;
  }

  async validarYConvertirAResumen(
    producto: {
      id: string;
      nombre: string;
      talle: string;
      precioCentavos: bigint | number;
      stock: number;
    },
    cantidad: number,
  ): Promise<CarritoItemResumen> {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    if (cantidad > producto.stock) {
      throw new BadRequestException('Stock insuficiente');
    }

    const precioCentavosNum: number = typeof producto.precioCentavos === 'bigint'
      ? Number(producto.precioCentavos)
      : producto.precioCentavos;

    return {
      productoId: producto.id,
      nombre: producto.nombre,
      talle: producto.talle,
      precioCentavos: precioCentavosNum,
      cantidad,
      subtotalCentavos: this.calcularSubtotal(precioCentavosNum, cantidad),
    };
  }

  async agregarAlCarrito(dto: AgregarCarritoDto): Promise<{ mensaje: string; carrito: CarritoItemResumen[] }> {
    const { productoId, cantidad, talle } = dto;

    const producto = await this.obtenerProductoPorId(productoId);

    if (talle && producto.talle !== talle) {
      throw new BadRequestException('El talle seleccionado no corresponde con el producto');
    }

    const itemResumen: CarritoItemResumen = await this.validarYConvertirAResumen(producto, cantidad);

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

      const stockInsuficiente = itemCarrito.cantidad > producto.stock;

      if (stockInsuficiente) {
        hayStockInsuficiente = true;
      }

      const precioCentavosNum = Number(producto.precioCentavos);
      const itemValidado: CarritoItemValidado = {
        productoId: producto.id,
        nombre: producto.nombre,
        talle: producto.talle,
        precioCentavos: precioCentavosNum,
        cantidad: itemCarrito.cantidad,
        subtotalCentavos: this.calcularSubtotal(precioCentavosNum, itemCarrito.cantidad),
        stockDisponible: producto.stock,
        stockInsuficiente,
      };

      itemsValidados.push(itemValidado);
    }

    const totalBig = itemsValidados.reduce(
      (acumulador, item) => acumulador + BigInt(item.subtotalCentavos),
      BigInt(0),
    );

    return {
      items: itemsValidados,
      totalCentavos: Number(totalBig),
      hayStockInsuficiente,
    };
  }

  async actualizarCantidad(
    productoId: string,
    talle: string,
    dto: ActualizarCarritoDto,
  ): Promise<CarritoItemResumen> {
    const { cantidad } = dto;
    const producto = await this.obtenerProductoPorId(productoId);

    if (talle && producto.talle !== talle) {
      throw new BadRequestException('El talle seleccionado no corresponde con el producto');
    }

    return this.validarYConvertirAResumen(producto, cantidad);
  }

  async eliminarDelCarrito(productoId: string): Promise<void> {
    const producto = await this.obtenerProductoPorId(productoId);
    void producto;
  }
}
