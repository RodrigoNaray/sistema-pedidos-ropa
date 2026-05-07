'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CarritoItemCard } from '@/components/carrito/CarritoItemCard';
import { CarritoTotal } from '@/components/carrito/CarritoTotal';
import { CarritoEmpty } from '@/components/carrito/CarritoEmpty';
import {
  obtenerDelStorage,
  guardarEnStorage,
  validarCarrito,
  type CarritoItem,
} from '@/services/carrito.service';
import styles from './CarritoPage.module.css';
import { motionConfig, fadeInUp } from '@/lib/animations';

export default function CarritoPage() {
  const router = useRouter();
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [validatedItems, setValidatedItems] = useState<
    (CarritoItem & { stockDisponible: number; stockInsuficiente?: boolean })[]
  >([]);
  const [totalCentavos, setTotalCentavos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hayStockInsuficiente, setHayStockInsuficiente] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const carrito = obtenerDelStorage();
    if (carrito.length > 0) {
      setItems(carrito);
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      validarItems();
    }
  }, [items]);

  const validarItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const resultado = await validarCarrito(items);

    if (resultado.ok) {
      setValidatedItems(
        resultado.value.items.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          talle: item.talle,
          precioCentavos: item.precioCentavos,
          cantidad: item.cantidad,
          subtotalCentavos: item.subtotalCentavos,
          stockDisponible: item.stockDisponible,
          stockInsuficiente: item.stockInsuficiente,
        })),
      );
      setTotalCentavos(resultado.value.totalCentavos);
      setHayStockInsuficiente(resultado.value.hayStockInsuficiente ?? false);
    } else {
      setError(resultado.error.message);
    }

    setLoading(false);
  }, [items]);

  const actualizarCantidad = useCallback(
    (productoId: string, nuevaCantidad: number) => {
      const actualizados = items.map((item) =>
        item.productoId === productoId
          ? { ...item, cantidad: nuevaCantidad, subtotalCentavos: item.precioCentavos * nuevaCantidad }
          : item,
      );
      setItems(actualizados);
      guardarEnStorage(actualizados);
    },
    [items],
  );

  const eliminarItem = useCallback(
    (productoId: string) => {
      const actualizados = items.filter((item) => item.productoId !== productoId);
      setItems(actualizados);
      guardarEnStorage(actualizados);
    },
    [items],
  );

  const crearPedido = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  if (items.length === 0 && validatedItems.length === 0) {
    return (
      <main className={styles.paginaPrincipal}>
        <CarritoEmpty />
      </main>
    );
  }

  return (
    <main className={styles.paginaPrincipal}>
      <div className={styles.contenido}>
        <motion.h1
          className={styles.titulo}
          initial="hidden"
          animate={visible ? 'visible' : 'hidden'}
          variants={fadeInUp}
          transition={motionConfig}
        >
          Tu carrito
        </motion.h1>

        {loading && <span className={styles.cargando}>Validando productos...</span>}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorTexto}>{error}</p>
            <button
              type="button"
              className={styles.botonReintentar}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className={styles.listaContenido}>
          <div className={styles.lista}>
            {validatedItems.length > 0 &&
              validatedItems.map((item) => (
                <motion.div
                  key={item.productoId}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={motionConfig}
                >
                  <CarritoItemCard
                    item={{
                      productoId: item.productoId,
                      nombre: item.nombre,
                      talle: item.talle,
                      precioCentavos: item.precioCentavos,
                      cantidad: item.cantidad,
                      subtotalCentavos: item.subtotalCentavos,
                    }}
                    onUpdateQuantity={(cantidad) => actualizarCantidad(item.productoId, cantidad)}
                    onRemove={() => eliminarItem(item.productoId)}
                    stockDisponible={item.stockDisponible}
                  />
                </motion.div>
              ))}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ ...motionConfig, delay: 0.1 }}
          >
            <CarritoTotal
              totalCentavos={totalCentavos}
              hayStockInsuficiente={hayStockInsuficiente}
              onCheckout={crearPedido}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}