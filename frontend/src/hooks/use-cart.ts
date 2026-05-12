import { useState, useEffect, useCallback } from 'react';
import {
  obtenerDelStorage,
  guardarEnStorage,
  limpiarStorage,
  agregarAlCarrito as agregarAlCarritoApi,
  validarCarrito as validarCarritoApi,
  actualizarCantidadEnCarrito as actualizarCantidadEnCarritoApi,
  eliminarDelCarrito as eliminarDelCarritoApi,
  type CarritoItem,
  type ValidarCarritoResponse,
} from '../services/carrito.service';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

interface EstadoCarrito {
  items: CarritoItem[];
  cargando: boolean;
  error: string | null;
}

export function useCart() {
  const [estado, setEstado] = useState<EstadoCarrito>({
    items: [],
    cargando: false,
    error: null,
  });

  useEffect(() => {
    const items: CarritoItem[] = obtenerDelStorage();
    setEstado((prev) => ({ ...prev, items }));
  }, []);

  const establecerError = useCallback((mensaje: string) => {
    setEstado((prev) => ({ ...prev, error: mensaje }));
  }, []);

  const limpiarError = useCallback(() => {
    setEstado((prev) => ({ ...prev, error: null }));
  }, []);

  async function agregar(productoId: string, cantidad: number, talle?: string) {
    setEstado((prev) => ({ ...prev, cargando: true, error: null }));
    const resultado: Result<{ carrito: CarritoItem[] }> = await agregarAlCarritoApi({ productoId, cantidad, talle });
    if (resultado.ok) {
      guardarEnStorage(resultado.value.carrito);
      setEstado((prev) => ({ ...prev, items: resultado.value.carrito, cargando: false }));
    } else {
      const mensaje: string = resultado.error instanceof Error ? resultado.error.message : 'Error desconocido';
      setEstado((prev) => ({ ...prev, cargando: false, error: mensaje }));
    }
  }

  async function validar(): Promise<ValidarCarritoResponse | null> {
    setEstado((prev) => ({ ...prev, cargando: true, error: null }));
    const itemsParaValidar: CarritoItem[] = obtenerDelStorage();
    if (itemsParaValidar.length === 0) {
      setEstado((prev) => ({ ...prev, cargando: false }));
      return null;
    }
    const resultado: Result<ValidarCarritoResponse> = await validarCarritoApi(itemsParaValidar);
    if (resultado.ok) {
      setEstado((prev) => ({ ...prev, cargando: false }));
      return resultado.value;
    } else {
      const mensaje: string = resultado.error instanceof Error ? resultado.error.message : 'Error desconocido';
      setEstado((prev) => ({ ...prev, cargando: false, error: mensaje }));
      return null;
    }
  }

  async function actualizar(productoId: string, talle: string, cantidad: number) {
    setEstado((prev) => ({ ...prev, cargando: true, error: null }));
    const resultado: Result<CarritoItem> = await actualizarCantidadEnCarritoApi(productoId, { cantidad });
    if (resultado.ok) {
      const existentes: CarritoItem[] = obtenerDelStorage();
      const index: number = existentes.findIndex(
        (item) => item.productoId === productoId && item.talle === talle,
      );
      if (index !== -1) {
        existentes[index] = resultado.value;
        guardarEnStorage(existentes);
        setEstado((prev) => ({ ...prev, items: existentes, cargando: false }));
      }
    } else {
      const mensaje: string = resultado.error instanceof Error ? resultado.error.message : 'Error desconocido';
      setEstado((prev) => ({ ...prev, cargando: false, error: mensaje }));
    }
  }

  async function eliminar(productoId: string, talle: string) {
    setEstado((prev) => ({ ...prev, cargando: true, error: null }));
    const resultado: Result<{ mensaje: string }> = await eliminarDelCarritoApi(productoId);
    if (resultado.ok) {
      const existentes: CarritoItem[] = obtenerDelStorage();
      const filtrados: CarritoItem[] = existentes.filter(
        (item) => !(item.productoId === productoId && item.talle === talle),
      );
      guardarEnStorage(filtrados);
      setEstado((prev) => ({ ...prev, items: filtrados, cargando: false }));
    } else {
      const mensaje: string = resultado.error instanceof Error ? resultado.error.message : 'Error desconocido';
      setEstado((prev) => ({ ...prev, cargando: false, error: mensaje }));
    }
  }

  function vaciar() {
    limpiarStorage();
    setEstado((prev) => ({ ...prev, items: [], error: null }));
  }

  function obtenerTotal(): number {
    return estado.items.reduce((acumulador, item) => acumulador + item.subtotalCentavos, 0);
  }

  function obtenerCantidadTotal(): number {
    return estado.items.reduce((acumulador, item) => acumulador + item.cantidad, 0);
  }

  function estaVacio(): boolean {
    return estado.items.length === 0;
  }

  return {
    estado,
    cargando: estado.cargando,
    error: estado.error,
    items: estado.items,
    total: obtenerTotal(),
    cantidadTotal: obtenerCantidadTotal(),
    estaVacio: estaVacio(),
    agregar,
    validar,
    actualizar,
    eliminar,
    vaciar,
    limpiarError,
  };
}