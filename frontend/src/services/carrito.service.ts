/**
 * Servicio para consumir la API de carrito del backend.
 * Implementa el patron Result para manejo de errores.
 */

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export interface CarritoItem {
  productoId: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
}

interface CarritoItemValidado extends CarritoItem {
  stockDisponible: number;
  stockInsuficiente?: boolean;
}

interface AgregarCarritoResponse {
  mensaje: string;
  carrito: CarritoItem[];
}

export interface ValidarCarritoResponse {
  items: CarritoItemValidado[];
  totalCentavos: number;
  hayStockInsuficiente?: boolean;
}

interface AgregarCarritoDto {
  productoId: string;
  cantidad: number;
  talle?: string;
}

interface ActualizarCarritoDto {
  cantidad: number;
}

interface ActualizarCarritoResponse extends CarritoItem {}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const STORAGE_KEY = 'carrito_session';

function generarSessionId(): string {
  const existe = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
  if (existe) {
    return existe;
  }
  const nuevo = crypto.randomUUID();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, nuevo);
  }
  return nuevo;
}

export function obtenerDelStorage(): CarritoItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarEnStorage(items: CarritoItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function limpiarStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export async function agregarAlCarrito(dto: AgregarCarritoDto): Promise<Result<AgregarCarritoResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/carrito/agregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: new Error(errorData.message || `Error HTTP: ${response.status}`),
      };
    }

    const data: AgregarCarritoResponse = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function validarCarrito(items: CarritoItem[]): Promise<Result<ValidarCarritoResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/carrito/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: new Error(errorData.message || `Error HTTP: ${response.status}`),
      };
    }

    const data: ValidarCarritoResponse = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function actualizarCantidadEnCarrito(
  productoId: string,
  dto: ActualizarCarritoDto,
): Promise<Result<ActualizarCarritoResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/carrito/items/${productoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: new Error(errorData.message || `Error HTTP: ${response.status}`),
      };
    }

    const data: ActualizarCarritoResponse = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function eliminarDelCarrito(
  productoId: string,
): Promise<Result<{ mensaje: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/carrito/items/${productoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: new Error(errorData.message || `Error HTTP: ${response.status}`),
      };
    }

    const data: { mensaje: string } = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
