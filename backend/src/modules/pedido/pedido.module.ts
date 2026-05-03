import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { ProductoModule } from '../producto/producto.module';

@Module({
  controllers: [PedidoController],
  providers: [PedidoService],
  imports: [ProductoModule],
})
export class PedidoModule {}