import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/config/database/prisma.service';
import bcrypt from 'bcrypt';

export interface AdminCreateResult {
  id: string;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: AdminCreateResult;
}

export interface AdminBasic {
  id: string;
  email: string;
  claveHash: string;
  nombre: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validarAdmin(email: string, password: string): Promise<AuthResponse> {
    const admin: { id: string; email: string; claveHash: string; nombre: string } | null = await this.prisma.administrador.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch: boolean = await bcrypt.compare(password, admin.claveHash);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: admin.id, email: admin.email, rol: 'admin' as const };
    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email },
    };
  }

  async registrarAdmin(nombre: string, email: string, password: string): Promise<AdminCreateResult> {
    const existingAdmin: { id: string; email: string; claveHash: string; nombre: string } | null = await this.prisma.administrador.findUnique({ where: { email } });
    if (existingAdmin) throw new Error('El email ya está registrado');

    const hashedPassword: string = await bcrypt.hash(password, 12);
    const admin: AdminCreateResult = await this.prisma.administrador.create({
      data: { nombre, email, claveHash: hashedPassword },
    });

    return { id: admin.id, nombre: admin.nombre, email: admin.email };
  }
}