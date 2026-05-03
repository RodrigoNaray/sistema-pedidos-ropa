import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/config/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validarAdmin(email: string, password: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, admin.claveHash);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: admin.id, email: admin.email, rol: 'admin' };
    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email },
    };
  }

  async registrarAdmin(nombre: string, email: string, password: string) {
    const existingAdmin = await this.prisma.administrador.findUnique({ where: { email } });
    if (existingAdmin) throw new Error('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await this.prisma.administrador.create({
      data: { nombre, email, claveHash: hashedPassword },
    });

    return { id: admin.id, nombre: admin.nombre, email: admin.email };
  }
}