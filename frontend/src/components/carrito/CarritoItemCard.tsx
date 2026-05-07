import type { CarritoItem } from '@/services/carrito.service';
import styles from './CarritoItemCard.module.css';

interface CarritoItemCardProps {
  item: CarritoItem;
  onUpdateQuantity: (cantidad: number) => void;
  onRemove: () => void;
  stockDisponible?: number;
}

export function CarritoItemCard({ item, onUpdateQuantity, onRemove, stockDisponible }: CarritoItemCardProps) {
  const handleIncrement = () => {
    onUpdateQuantity(item.cantidad + 1);
  };

  const handleDecrement = () => {
    if (item.cantidad > 1) {
      onUpdateQuantity(item.cantidad - 1);
    }
  };

  const handleRemove = () => {
    onRemove();
  };

  const stockInsuficiente = stockDisponible !== undefined && item.cantidad > stockDisponible;

  return (
    <div className={styles.carritoItemCard}>
      <div className={styles.itemInfo}>
        <span className={styles.itemNombre}>{item.nombre}</span>
        <span className={styles.itemTalle}>Talle: {item.talle}</span>
        <span
          className={`${styles.itemStock} ${stockInsuficiente ? styles.itemStockInsuficiente : ''}`}
        >
          {stockInsuficiente
            ? `Stock insuficiente (disponible: ${stockDisponible})`
            : stockDisponible !== undefined
              ? `Stock disponible: ${stockDisponible}`
              : ''}
        </span>
      </div>

      <div className={styles.itemCantidad}>
        <span className={styles.cantidadControl}>
          <button
            type="button"
            className={styles.botonCantidad}
            onClick={handleDecrement}
            disabled={item.cantidad <= 1}
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className={styles.cantidadValor} aria-label="Cantidad">{item.cantidad}</span>
          <button
            type="button"
            className={styles.botonCantidad}
            onClick={handleIncrement}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </span>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span className={styles.itemSubtotal}>$ {item.subtotalCentavos.toLocaleString('es-AR')}</span>
        <div>
          <button
            type="button"
            className={styles.botonEliminar}
            onClick={handleRemove}
            aria-label="Eliminar producto del carrito"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}