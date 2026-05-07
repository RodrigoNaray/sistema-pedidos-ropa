import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductoCarritoItemDto {
  @ApiProperty({ description: 'ID del producto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  declare productoId: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta básica' })
  declare nombre: string;

  @ApiProperty({ description: 'Talle del producto', example: 'M' })
  declare talle: string;

  @ApiProperty({ description: 'Precio unitario en centavos', example: 15000 })
  declare precioCentavos: number;

  @ApiProperty({ description: 'Cantidad agregada al carrito', example: 2 })
  declare cantidad: number;

  @ApiProperty({ description: 'Subtotal en centavos', example: 30000 })
  declare subtotalCentavos: number;

  @ApiProperty({ description: 'Stock disponible actual', example: 5 })
  declare stockDisponible: number;

  @ApiProperty({ description: 'Si el stock es insuficiente', example: false, required: false })
  declare stockInsuficiente?: boolean;
}

export class ValidarCarritoResponseDto {
  @ApiProperty({ description: 'Items del carrito validados' })
  @IsArray()
  declare items: ProductoCarritoItemDto[];

  @ApiProperty({ description: 'Total del carrito en centavos', example: 30000 })
  declare totalCentavos: number;

  @ApiProperty({ description: 'Si hay items con stock insuficiente', example: false, required: false })
  declare hayStockInsuficiente?: boolean;
}