export interface Notificacion {
  id: string;
  canal: string;
  mensaje: string;
  leida: boolean;
  creadoEn: Date;
  pedidoId: string | null;
}

export interface NotificacionDetalle {
  notificacion: Notificacion;
  pedido: NotificacionDetallePedido | null;
}

export interface NotificacionDetallePedido {
  id: string;
  emailComprador: string;
  telefonoComprador: string;
  estado: string;
  totalCentavos: number;
  codigo: string;
  creadoEn: Date;
  confirmadoEn: Date | null;
  vencidoEn: Date;
}

export type NotificacionFiltro = 'all' | 'unread';

export interface ListarNotificacionesQuery {
  filtro?: NotificacionFiltro;
}