import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ description: 'Email del administrador', example: 'admin@ejemplo.com' })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'Contraseña', example: 'MiContraseña123!' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}