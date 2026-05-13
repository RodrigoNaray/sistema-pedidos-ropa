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
    if (!email || !password) {
      throw new UnauthorizedException('Complete todos los campos');
    }

    const admin = await this.prisma.administrador.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Email no registrado');
    }

    const passwordMatch = await bcrypt.compare(password, admin.claveHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Clave incorrecta');
    }

    await this.prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimoAccesoEn: new Date() },
    });

    const payload = { sub: admin.id, email: admin.email, rol: 'admin' as const };

    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email },
    };
  }

  async registrarAdmin(nombre: string, email: string, password: string): Promise<AdminCreateResult> {
    const existingAdmin = await this.prisma.administrador.findUnique({ where: { email } });
    if (existingAdmin) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return this.prisma.administrador.create({
      data: { nombre, email, claveHash: hashedPassword },
    });
  }
}