import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ItemInput {
  @ApiProperty({ description: 'ID del producto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsString()
  declare productoId: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta básica' })
  @IsString()
  declare nombre: string;

  @ApiProperty({ description: 'Talle del producto', example: 'M' })
  @IsString()
  declare talle: string;

  @ApiProperty({ description: 'Precio unitario en centavos', example: 15000 })
  @IsNumber()
  declare precioCentavos: number;

  @ApiProperty({ description: 'Cantidad agregada al carrito', example: 2 })
  @IsNumber()
  declare cantidad: number;

  @ApiProperty({ description: 'Subtotal en centavos', example: 30000 })
  @IsNumber()
  declare subtotalCentavos: number;
}

export class ValidarCarritoInputDto {
  @ApiProperty({ description: 'Items del carrito a validar' })
  @IsArray()
  declare items: ItemInput[];
}