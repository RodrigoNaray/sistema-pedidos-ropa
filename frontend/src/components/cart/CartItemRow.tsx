import styles from './CartItemRow.module.css';

interface CartItemRowProps {
  productoId: string;
  nombre: string;
  talle: string;
  precioUnitarioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
  enStock: boolean;
  enStockMinimo: boolean;
  enStockInsuficiente: boolean;
  enCarrito: boolean;
  onQuantityChange: (cantidad: number) => void;
  onDelete: () => void;
}

function formatearPeso(cantidad: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(cantidad / 100);
}

export function CartItemRow({
  nombre,
  talle,
  precioUnitarioCentavos,
  cantidad,
  subtotalCentavos,
  enStock,
  enStockMinimo,
  enStockInsuficiente,
  enCarrito,
  onQuantityChange,
  onDelete,
}: CartItemRowProps) {
  const estadoClase: string = enStockInsuficiente
    ? styles.estadoInsuficiente
    : enStockMinimo
      ? styles.estadoMinimo
      : enStock
        ? styles.estadoOk
        : styles.estadoAgotado;

  const estadoTexto: string = enStockInsuficiente
    ? 'Stock insuficiente'
    : enStockMinimo
      ? 'Stock minimo'
      : enStock
        ? 'En stock'
        : 'Agotado';

  const handleIncrement = (): void => {
    onQuantityChange(cantidad + 1);
  };

  const handleDecrement = (): void => {
    onQuantityChange(cantidad - 1);
  };

  const handleInputChange = (evento: React.ChangeEvent<HTMLInputElement>): void => {
    const valor: number = parseInt(evento.target.value, 10);
    if (!isNaN(valor) && valor > 0) {
      onQuantityChange(valor);
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.imagenWrapper}>
        <div className={styles.imagenPlaceholder}>
          <span className={styles.imagenTexto}>S</span>
        </div>
      </div>

      <div className={styles.informacion}>
        <div className={styles.encabezadoProducto}>
          <h3 className={styles.nombreProducto}>{nombre}</h3>
          <span className={estadoClase}>{estadoTexto}</span>
        </div>

        <p className={styles.talle}>Talle: {talle}</p>

        <div className={styles.rowPrecioCantidad}>
          <div className={styles.seccionCantidad}>
            <span className={styles.labelCantidad}>Cantidad:</span>
            <div className={styles.controlCantidad}>
              <button
                className={`${styles.botoncantidad} ${cantidad <= 1 ? styles.botoncantidadDesactivado : ''}`}
                onClick={handleDecrement}
                disabled={cantidad <= 1}
                aria-label="Reducir cantidad"
              >
                -
              </button>
              <input
                type="number"
                className={styles.inputCantidad}
                value={cantidad}
                onChange={handleInputChange}
                aria-label="Cantidad"
                min={1}
              />
              <button
                className={styles.botoncantidad}
                onClick={handleIncrement}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.seccionPrecio}>
            <span className={styles.precioUnitario}>
              {formatearPeso(precioUnitarioCentavos)} c/u
            </span>
          </div>

          <div className={styles.seccionSubtotal}>
            <span className={styles.labelSubtotal}>Subtotal:</span>
            <span className={styles.valorSubtotal}>
              {formatearPeso(subtotalCentavos)}
            </span>
          </div>
        </div>
      </div>

      <button
        className={styles.botoneEliminar}
        onClick={onDelete}
        aria-label="Eliminar producto del carrito"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>
  );
}