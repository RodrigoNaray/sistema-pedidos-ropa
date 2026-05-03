import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarAdminDto {
  @ApiProperty({ description: 'Nombre del administrador', example: 'Carlos Admin' })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @ApiProperty({ description: 'Email del administrador', example: 'admin@tienda.com' })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'Contraseña (mínimo 8 caracteres)', example: 'MiPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;

  constructor(nombre: string, email: string, password: string) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
  }
}