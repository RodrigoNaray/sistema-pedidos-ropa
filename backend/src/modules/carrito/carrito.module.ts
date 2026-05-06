import { Module } from '@nestjs/common';
import { CarritoController } from './carrito.controller';
import { CarritoService } from './carrito.service';
import { PrismaService } from '@common/config/database/prisma.service';

@Module({
  controllers: [CarritoController],
  providers: [CarritoService, PrismaService],
  exports: [CarritoService],
})
export class CarritoModule {}