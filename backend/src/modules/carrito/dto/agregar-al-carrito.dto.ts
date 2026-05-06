import { IsString, IsNumber, Min, ValidateIf, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgregarCarritoDto {
  @ApiProperty({ description: 'ID del producto a agregar', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  declare productoId: string;

  @ApiProperty({ description: 'Cantidad del producto', example: 2 })
  @IsNumber()
  @Min(1)
  declare cantidad: number;

  @ApiPropertyOptional({ description: 'Talle del producto', example: 'M' })
  @ValidateIf((o) => o.cantidad > 0)
  @IsString()
  declare talle?: string;
}
