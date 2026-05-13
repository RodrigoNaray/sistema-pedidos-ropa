import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RegistrarAdminDto } from './dto/registrar-admin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Formulario de inicio de sesión como administrador' })
  @ApiResponse({ status: 200, description: 'Formulario de login renderizado' })
  getAdminLogin() {
    return { message: 'admin/login' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión como administrador' })
  @ApiBody({
    type: LoginAdminDto,
    description: 'Credenciales de inicio de sesión',
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      stopAtFirstError: true,
    }),
  )
  async login(@Body() dto: LoginAdminDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Complete todos los campos');
    }
    return this.authService.validarAdmin(dto.email, dto.password);
  }

  @Post('registrar-admin')
  @ApiOperation({ summary: 'Registrar nuevo administrador' })
  @ApiResponse({ status: 201, description: 'Administrador registrado' })
  async registrarAdmin(@Body() dto: RegistrarAdminDto) {
    return this.authService.registrarAdmin(dto.nombre, dto.email, dto.password);
  }
}