import { IsString, IsNumber, IsArray, Min, ValidateArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ItemDto {
  @ApiProperty({ description: 'ID del producto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  productoId: string;

  @ApiProperty({ description: 'Cantidad del producto', example: 2 })
  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @ApiProperty({ description: 'Email del comprador', example: 'comprador@email.com' })
  @IsString()
  emailComprador: string;

  @ApiProperty({ description: 'Teléfono del comprador', example: '+59899123456' })
  @IsString()
  telefonoComprador: string;

  @ApiProperty({ description: 'Items del pedido', type: [ItemDto] })
  @IsArray()
  items: ItemDto[];
}