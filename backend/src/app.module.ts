import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductoModule } from '@modules/modules/producto/producto.module';
import { PedidoModule } from '@modules/modules/pedido/pedido.module';
import { AuthModule } from '@modules/modules/auth/auth.module';
import { AdministradorModule } from '@modules/modules/administrador/administrador.module';
import { ConfiguracionTiendaModule } from '@modules/modules/configuracion/configuracion-tienda.module';
import { NotificacionModule } from '@modules/modules/notificacion/notificacion.module';
import { DatabaseModule } from '@common/config/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ProductoModule,
    PedidoModule,
    AuthModule,
    AdministradorModule,
    ConfiguracionTiendaModule,
    NotificacionModule,
  ],
})
export class AppModule {}