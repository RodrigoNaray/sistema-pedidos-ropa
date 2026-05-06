/**
 * Utilidad de persistencia del carrito usando sessionStorage.
 * El carrito se almacena como un array de objetos carrito-item en formato JSON.
 */

const STORAGE_KEY = 'carrito-item';

export interface CarritoItemStorage {
  productoId: string;
  cantidad: number;
  talle: string;
}

export function obtenerItemsDelCarrito(): CarritoItemStorage[] {
  try {
    const datos = sessionStorage.getItem(STORAGE_KEY);
    if (!datos) return [];
    const parsed = JSON.parse(datos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarItemsEnCarrito(items: CarritoItemStorage[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function vaciarCarrito(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function agregarItemAlCarrito(productoId: string, cantidad: number, talle?: string): CarritoItemStorage[] {
  const items = obtenerItemsDelCarrito();
  const itemExistente = items.find((i) => i.productoId === productoId && i.talle === (talle ?? ''));

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    items.push({ productoId, cantidad, talle: talle ?? '' });
  }

  guardarItemsEnCarrito(items);
  return items;
}