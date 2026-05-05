/**
 * Componente presentacional para mostrar el detalle de un producto.
 * Renderiza galeria de imagenes, nombre, talle, descripcion, precio
 * y boton para agregar al carrito.
 */

'use client';

import Image from 'next/image';
import styles from './DetalleProducto.module.css';

interface DetalleProductoProps {
  producto: ProductoData;
  onAgregarAlCarrito: (productoId: string) => void;
  onReintento?: () => void;
  estado: 'cargando' | 'error' | 'inactivo';
}

interface ProductoData {
  id: string;
  nombre: string;
  descripcion: string | null;
  talle: string;
  precioCentavos: number;
  stock: number;
  imagenes: string[];
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export default function DetalleProducto({
  producto,
  onAgregarAlCarrito,
  onReintento,
  estado,
}: DetalleProductoProps) {
  // Estado: cargando
  if (estado === 'cargando') {
    return (
      <main className={styles.contenedor}>
        <p>Cargando detalle del producto...</p>
      </main>
    );
  }

  // Estado: error
  if (estado === 'error') {
    return (
      <main className={styles.error}>
        <h2 className={styles.errorTitulo}>Producto no encontrado</h2>
        <p className={styles.errorMensaje}>
          El producto que buscas no existe o fue desactivado.
        </p>
        {onReintento && (
          <button className={styles.botonReintento} onClick={onReintento}>
            Reintentar
          </button>
        )}
      </main>
    );
  }

  // Estado: inactivo
  if (estado === 'inactivo') {
    return (
      <main className={styles.error}>
        <h2 className={styles.errorTitulo}>Producto desactivado</h2>
        <p className={styles.errorMensaje}>
          Este producto ya no se encuentra disponible en nuestra tienda.
        </p>
      </main>
    );
  }

  // Estado: producto válido
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(producto.precioCentavos / 100);

  const imagenesMostrar = producto.imagenes.length > 0 ? producto.imagenes : [];
  const imagenPrincipal = imagenesMostrar[0] || '/placeholder.png';

  return (
    <main className={styles.contenedor}>
      {/* Galeria de imagenes */}
      <section className={styles.galeria}>
        <Image
          src={imagenPrincipal}
          alt={producto.nombre}
          className={styles.imagenPrincipal}
          width={600}
          height={600}
        />
        {imagenesMostrar.length > 1 && (
          <div className={styles.imagenesThumbnails}>
            {imagenesMostrar.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`${producto.nombre} - Vista ${index + 1}`}
                className={styles.thumnail}
                width={72}
                height={72}
              />
            ))}
          </div>
        )}
      </section>

      {/* Informacion del producto */}
      <section className={styles.info}>
        <h1 className={styles.nombre}>{producto.nombre}</h1>
        <span className={styles.talle}>Talle: {producto.talle}</span>
        <p className={styles.precio}>{precioFormateado}</p>
        <hr className={styles.separador} />
        <p className={styles.descripcion}>
          {producto.descripcion || 'Sin descripcion disponible.'}
        </p>

        {producto.activo && producto.stock > 0 && (
          <button
            className={styles.botonCarrito}
            onClick={() => onAgregarAlCarrito(producto.id)}
          >
            Agregar al carrito
          </button>
        )}

        {!producto.activo && <p className={styles.inactivo}>Producto desactivado</p>}
        {producto.activo && producto.stock === 0 && (
          <p className={styles.inactivo}>Agotado - Sin stock disponible</p>
        )}
      </section>
    </main>
  );
}