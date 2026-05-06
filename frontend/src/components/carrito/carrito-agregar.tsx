import type { PropsWithChildren, ReactNode } from 'react';
import { useState, useCallback } from 'react';
import styles from './carrito-agregar.module.css';
import { useCarrito } from './carrito-context';

interface Props {
  productoId: string;
  stockDisponible: number;
  onExito?: (mensaje: string) => void;
  onError?: (mensaje: string) => void;
}

export default function CarritoAgregar({ productoId, stockDisponible, onExito, onError }: PropsWithChildren<Props>) {
  const { agregarItem } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [estado, setEstado] = useState<'listo' | 'exito' | 'error'>('listo');
  const [mensaje, setMensaje] = useState('');

  const decrementar = useCallback(() => {
    setCantidad((prev) => Math.max(1, prev - 1));
  }, []);

  const incrementar = useCallback(() => {
    setCantidad((prev) => Math.min(stockDisponible, prev + 1));
  }, [stockDisponible]);

  const manejarEnvio = useCallback(async () => {
    setEstado('listo');
    setMensaje('');

    const exito = await agregarItem(productoId, cantidad);

    if (exito) {
      setEstado('exito');
      setMensaje('Producto agregado al carrito');
      onExito?.('Producto agregado al carrito');
    } else {
      setEstado('error');
      setMensaje('No se pudo agregar el producto al carrito');
      onError?.('No se pudo agregar el producto al carrito');
    }
  }, [agregarItem, productoId, cantidad, onExito, onError]);

  const cantidadValida = cantidad > 0 && cantidad <= stockDisponible;
  const estaDesactivado = !cantidadValida || stockDisponible === 0;

  return (
    <div className={styles.contenedor}>
      <div className={styles.grupoCantidad}>
        <span className={styles.labelCantidad}>Cantidad:</span>
        <div className={styles.controladorCantidad}>
          <button
            type="button"
            className={styles.botonCantidad}
            onClick={decrementar}
            disabled={cantidad <= 1 || estaDesactivado}
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <input
            type="number"
            className={styles.inputCantidad}
            value={cantidad}
            min={1}
            max={stockDisponible}
            readOnly
            aria-label="Cantidad"
          />
          <button
            type="button"
            className={styles.botonCantidad}
            onClick={incrementar}
            disabled={cantidad >= stockDisponible || estaDesactivado}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      <hr className={styles.divisor} />

      <button
        type="button"
        className={`${styles.botonAgregar} ${estaDesactivado ? styles.solicitando : ''}`}
        onClick={manejarEnvio}
        disabled={estaDesactivado}
      >
        {estaDesactivado ? (
          stockDisponible === 0 ? 'Agotado' : 'Selecciona una cantidad valida'
        ) : (
          'Agregar al carrito'
        )}
      </button>

      {estado === 'exito' && (
        <p className={styles.mensajeExito} role="status">{mensaje}</p>
      )}
      {estado === 'error' && (
        <p className={styles.mensajeError} role="alert">{mensaje}</p>
      )}
    </div>
  );
}