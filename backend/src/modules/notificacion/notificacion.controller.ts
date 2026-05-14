import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificacionService } from './notificacion.service';
import { ListarNotificacionesDto } from './dto/listar-notificaciones.dto';

@ApiTags('notificaciones')
@ApiBearerAuth()
@Controller('admin/notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar notificaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones retornada correctamente',
  })
  async listar(@Query() filtros: ListarNotificacionesDto) {
    return this.notificacionService.listar(filtros);
  }

  @Get(':id/detalle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detalle de notificación' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de notificación con pedido asociado',
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async obtenerDetalle(@Param('id') id: string) {
    return this.notificacionService.obtenerDetalle(id);
  }

  @Patch(':id/leida')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async marcarComoLeida(@Param('id') id: string) {
    return this.notificacionService.marcarComoLeida(id);
  }
}