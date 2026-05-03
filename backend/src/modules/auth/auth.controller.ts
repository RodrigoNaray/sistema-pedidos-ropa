import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RegistrarAdminDto } from './dto/registrar-admin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión como administrador' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente' })
  async login(@Body() dto: LoginAdminDto) {
    return this.authService.validarAdmin(dto.email, dto.password);
  }

  @Post('registrar-admin')
  @ApiOperation({ summary: 'Registrar nuevo administrador' })
  @ApiResponse({ status: 201, description: 'Administrador registrado' })
  async registrarAdmin(@Body() dto: RegistrarAdminDto) {
    return this.authService.registrarAdmin(dto.nombre, dto.email, dto.password);
  }
}