import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarAdminDto {
  @ApiProperty({ description: 'Nombre del administrador', example: 'Carlos Admin' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Email del administrador', example: 'admin@tienda.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña (mínimo 8 caracteres)', example: 'MiPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}