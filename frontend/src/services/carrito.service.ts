/**
 * Servicio para consumir la API de carrito del backend.
 * Implementa el patron Result para manejo de errores.
 */

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

interface CarritoItemResumen {
  productoId: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
}

interface AgregarCarritoResponse {
  mensaje: string;
  carrito: CarritoItemResumen[];
}

interface AgregarCarritoDto {
  productoId: string;
  cantidad: number;
  talle?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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