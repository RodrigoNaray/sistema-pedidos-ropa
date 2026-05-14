import { Notificacion, NotificacionDetalle, NotificacionFiltro, ListarNotificacionesQuery } from '@/types/notificacion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchNotificaciones(filtro?: NotificacionFiltro): Promise<Notificacion[]> {
  const params = filtro ? `?filtro=${filtro}` : '';
  const response = await fetch(`${API_BASE_URL}/api/notificaciones/${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch notificaciones');
  }

  return response.json();
}

async function fetchNotificacionDetalle(id: string): Promise<NotificacionDetalle> {
  const response = await fetch(`${API_BASE_URL}/api/notificaciones/${id}/detalle`);

  if (!response.ok) {
    throw new Error('Failed to fetch notificacion detalle');
  }

  return response.json();
}

async function fetchMarcarComoLeida(id: string): Promise<{
  id: string;
  leida: boolean;
  creadoEn: Date;
}> {
  const response = await fetch(`${API_BASE_URL}/api/notificaciones/${id}/leida`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to mark notificacion as read');
  }

  return response.json();
}

export const notificacionService = {
  listar: async (query?: ListarNotificacionesQuery): Promise<Notificacion[]> => {
    return fetchNotificaciones(query?.filtro);
  },

  obtenerDetalle: async (id: string): Promise<NotificacionDetalle> => {
    return fetchNotificacionDetalle(id);
  },

  marcarComoLeida: async (id: string): Promise<{
    id: string;
    leida: boolean;
    creadoEn: Date;
  }> => {
    return fetchMarcarComoLeida(id);
  },
};