type CarritoItemInterno = {
  productoId: string;
  nombre: string;
  talle: string;
  precioUnitarioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
};

type CarritoAlmacen = Record<string, CarritoItemInterno>;

const CLAVE_ALMACEN = 'carrito-compras';

function obtenerClave(productoId: string, talle: string): string {
  return `${productoId}${talle ? `-${talle}` : ''}`;
}

function sincronizarConAlmacen(items: CarritoAlmacen): void {
  try {
    const dato: string = JSON.stringify(items);
    localStorage.setItem(CLAVE_ALMACEN, dato);
  } catch {
    throw new Error('No es posible almacenar el carrito en el navegador');
  }
}

function cargarDesdeAlmacen(): CarritoAlmacen {
  try {
    const dato: string | null = localStorage.getItem(CLAVE_ALMACEN);
    if (dato === null) {
      return {};
    }
    return JSON.parse(dato) as CarritoAlmacen;
  } catch {
    return {};
  }
}

export function obtenerItemsDelCarrito(): CarritoItemInterno[] {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  return Object.values(datos);
}

export function agregarAlCarrito(item: Omit<CarritoItemInterno, 'subtotalCentavos'>): void {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  const clave: string = obtenerClave(item.productoId, item.talle);
  const subtotalCentavos: number = item.precioUnitarioCentavos * item.cantidad;
  datos[clave] = { ...item, subtotalCentavos };
  sincronizarConAlmacen(datos);
}

export function actualizarCantidadEnCarrito(productoId: string, talle: string, cantidad: number): void {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  const clave: string = obtenerClave(productoId, talle);
  const existente: CarritoItemInterno | undefined = datos[clave];
  if (existente === undefined) {
    return;
  }
  if (cantidad <= 0) {
    eliminarDelCarrito(productoId, talle);
    return;
  }
  const subtotalCentavos: number = existente.precioUnitarioCentavos * cantidad;
  datos[clave] = { ...existente, cantidad, subtotalCentavos };
  sincronizarConAlmacen(datos);
}

export function eliminarDelCarrito(productoId: string, talle: string): boolean {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  const clave: string = obtenerClave(productoId, talle);
  if (!(clave in datos)) {
    return false;
  }
  delete datos[clave];
  sincronizarConAlmacen(datos);
  return true;
}

export function vaciarCarrito(): void {
  sincronizarConAlmacen({});
}

export function obtenerTotalDelCarrito(): number {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  const total: number = Object.values(datos).reduce(
    (acumulador, item) => acumulador + item.subtotalCentavos,
    0,
  );
  return total;
}

export function obtenerCantidadTotalDeItems(): number {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  const cantidad: number = Object.values(datos).reduce(
    (acumulador, item) => acumulador + item.cantidad,
    0,
  );
  return cantidad;
}

export function elCarritoEstaVacio(): boolean {
  const datos: CarritoAlmacen = cargarDesdeAlmacen();
  return Object.keys(datos).length === 0;
}