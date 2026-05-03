import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Remera Algodón' })
  @IsString()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Remera de algodón 100%' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'Talle del producto', example: 'M' })
  @IsString()
  talle: string;

  @ApiProperty({ description: 'Precio en centavos', example: 15000 })
  @IsNumber()
  @Min(0)
  precioCentavos: number;

  @ApiProperty({ description: 'Stock disponible', example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'URLs de imágenes', example: ['https://ej.com/img1.jpg'] })
  @IsOptional()
  @IsString({ each: true })
  imagenes?: string[];

  @ApiPropertyOptional({ description: 'Estado activo', example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}