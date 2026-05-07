import { useRouter } from 'next/navigation';
import styles from './CarritoTotal.module.css';

interface CarritoTotalProps {
  totalCentavos: number;
  hayStockInsuficiente?: boolean;
  onCheckout: () => void;
}

export function CarritoTotal({ totalCentavos, hayStockInsuficiente, onCheckout }: CarritoTotalProps) {
  const router = useRouter();

  const formatPeso = (valor: number) =>
    `$ ${valor.toLocaleString('es-AR')}`;

  const handleCheckout = () => {
    onCheckout();
    router.push('/checkout');
  };

  return (
    <div className={styles.carritoTotalContainer}>
      <div>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValor}>{formatPeso(totalCentavos)}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
        {hayStockInsuficiente && (
          <span className={styles.alertaStock}>
            Algunos items tienen stock insuficiente
          </span>
        )}
        <button
          type="button"
          className={styles.botonContinuar}
          onClick={handleCheckout}
        >
          Crear pedido
        </button>
      </div>
    </div>
  );
}