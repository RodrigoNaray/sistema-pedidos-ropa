import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { PrismaService } from '@common/config/database/prisma.service';

@Module({
  controllers: [NotificacionController],
  providers: [NotificacionService, PrismaService],
  exports: [NotificacionService],
})
export class NotificacionModule {}