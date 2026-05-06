import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductoModule } from '@modules/producto/producto.module';
import { PedidoModule } from '@modules/pedido/pedido.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AdministradorModule } from '@modules/administrador/administrador.module';
import { ConfiguracionTiendaModule } from '@modules/configuracion/configuracion-tienda.module';
import { NotificacionModule } from '@modules/notificacion/notificacion.module';
import { DatabaseModule } from '@common/config/database/database.module';
import { CarritoModule } from '@modules/carrito/carrito.module';

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
    CarritoModule,
  ],
})
export class AppModule {}