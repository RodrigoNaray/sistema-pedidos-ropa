/**
 * Contexto global del carrito de compras.
 * Persiste el estado en sessionStorage y sincroniza con el backend.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  obtenerItemsDelCarrito,
  guardarItemsEnCarrito,
  vaciarCarrito,
  agregarItemAlCarrito,
  CarritoItemStorage,
} from './carrito-storage';
import { agregarAlCarrito as agregarAlCarritoApi } from '@/services/carrito.service';

interface CarritoItem {
  productoId: string;
  cantidad: number;
  talle: string;
  nombre?: string;
  precioCentavos?: number;
  subtotalCentavos?: number;
}

type CarritoAction =
  | { type: 'INIT'; payload: CarritoItemStorage[] }
  | { type: 'ADD'; payload: CarritoItem }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QUANTITY'; productoId: string; cantidad: number }
  | { type: 'CLEAR' }
  | { type: 'UPDATE_ITEM_INFO'; payload: { productoId: string; nombre: string; precioCentavos: number; subtotalCentavos: number } };

interface CarritoContextType {
  items: CarritoItem[];
  agregarItem: (productoId: string, cantidad: number, talle?: string) => Promise<boolean>;
  eliminarItem: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
  totalCentavos: number;
  itemCount: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

function carritoReducer(state: CarritoItem[], action: CarritoAction): CarritoItem[] {
  switch (action.type) {
    case 'INIT':
      return action.payload.map((i) => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        talle: i.talle,
      }));
    case 'ADD':
      const existente = state.find(
        (i) => i.productoId === action.payload.productoId && i.talle === action.payload.talle
      );
      if (existente) {
        return state.map((i) =>
          i.productoId === action.payload.productoId && i.talle === action.payload.talle
            ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
            : i
        );
      }
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((i) => i.productoId !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.productoId === action.productoId ? { ...i, cantidad: action.cantidad } : i
      );
    case 'CLEAR':
      return [];
    case 'UPDATE_ITEM_INFO':
      return state.map((i) =>
        i.productoId === action.payload.productoId
          ? {
              ...i,
              nombre: action.payload.nombre,
              precioCentavos: action.payload.precioCentavos,
              subtotalCentavos: action.payload.subtotalCentavos,
            }
          : i
      );
    default:
      return state;
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(carritoReducer, []);

  // Inicializar desde sessionStorage al montar
  useEffect(() => {
    const stored = obtenerItemsDelCarrito();
    if (stored.length > 0) {
      dispatch({ type: 'INIT', payload: stored });
    }
  }, []);

  // Sincronizar con sessionStorage cuando cambian los items
  useEffect(() => {
    if (items.length > 0) {
      guardarItemsEnCarrito(
        items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad, talle: i.talle }))
      );
    } else {
      vaciarCarrito();
    }
  }, [items]);

  const agregarItem = useCallback(
    async (productoId: string, cantidad: number, talle?: string): Promise<boolean> => {
      const result = await agregarAlCarritoApi({ productoId, cantidad, talle });

      if (result.ok) {
        dispatch({
          type: 'ADD',
          payload: {
            productoId,
            cantidad,
            talle: talle ?? '',
            nombre: result.value.carrito[0]?.nombre,
            precioCentavos: result.value.carrito[0]?.precioCentavos,
            subtotalCentavos: result.value.carrito[0]?.subtotalCentavos,
          },
        });
        return true;
      }
      return false;
    },
    []
  );

  const eliminarItem = useCallback(
    (productoId: string) => {
      dispatch({ type: 'REMOVE', payload: productoId });
    },
    []
  );

  const actualizarCantidad = useCallback(
    (productoId: string, cantidad: number) => {
      if (cantidad <= 0) {
        eliminarItem(productoId);
        return;
      }
      dispatch({ type: 'UPDATE_QUANTITY', productoId, cantidad });
    },
    [eliminarItem]
  );

  const vaciar = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalCentavos = items.reduce((sum, i) => sum + (i.precioCentavos ?? 0) * i.cantidad, 0);
  const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{ items, agregarItem, eliminarItem, actualizarCantidad, vaciar, totalCentavos, itemCount }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito(): CarritoContextType {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
}

export type { CarritoContextType, CarritoItem };