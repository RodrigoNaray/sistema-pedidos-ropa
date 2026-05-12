import {
  IsString,
  IsNumber,
  IsArray,
  Min,
  IsNotEmpty,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ItemDto {
  @ApiProperty({ description: 'ID del producto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  readonly productoId: string;

  @ApiProperty({ description: 'Cantidad del producto', example: 2 })
  @IsNumber()
  @Min(1)
  readonly cantidad: number;

  constructor(productoId: string, cantidad: number) {
    this.productoId = productoId;
    this.cantidad = cantidad;
  }
}

export class CreatePedidoDto {
  @ApiProperty({ description: 'Email del comprador', example: 'comprador@email.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly emailComprador: string;

  @ApiProperty({ description: 'Teléfono del comprador', example: '+59899123456' })
  @IsString()
  @IsNotEmpty()
  readonly telefonoComprador: string;

  @ApiProperty({ description: 'Items del pedido', type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  readonly items: ItemDto[];

  @ApiPropertyOptional({ description: 'Talles de los productos (opcional)', example: ['M', 'L'] })
  @IsString({ each: true })
  readonly talles?: string[];

  constructor(emailComprador: string, telefonoComprador: string, items: ItemDto[]) {
    this.emailComprador = emailComprador;
    this.telefonoComprador = telefonoComprador;
    this.items = items;
  }
}
