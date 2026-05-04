import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Remera Algodón' })
  @IsString()
  @MaxLength(255)
  readonly nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Remera de algodón 100%' })
  @IsOptional()
  @IsString()
  readonly descripcion?: string | undefined;

  @ApiProperty({ description: 'Talle del producto', example: 'M' })
  @IsString()
  readonly talle: string;

  @ApiProperty({ description: 'Precio en centavos', example: 15000 })
  @IsNumber()
  @Min(0)
  readonly precioCentavos: number;

  @ApiProperty({ description: 'Stock disponible', example: 100 })
  @IsNumber()
  @Min(0)
  readonly stock: number;

  @ApiPropertyOptional({ description: 'URLs de imágenes', example: ['https://ej.com/img1.jpg'] })
  @IsOptional()
  @IsString({ each: true })
  readonly imagenes?: string[] | undefined;

  @ApiPropertyOptional({ description: 'Estado activo', example: true })
  @IsOptional()
  @IsBoolean()
  readonly activo?: boolean | undefined;

  constructor(
    nombre: string,
    talle: string,
    precioCentavos: number,
    stock: number,
    descripcion?: string | undefined,
    imagenes?: string[] | undefined,
    activo?: boolean | undefined,
  ) {
    this.nombre = nombre;
    this.talle = talle;
    this.precioCentavos = precioCentavos;
    this.stock = stock;
    this.descripcion = descripcion ?? undefined;
    this.imagenes = imagenes ?? undefined;
    this.activo = activo ?? undefined;
  }
}