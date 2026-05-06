/**
 * Pagina de detalle de producto (cliente).
 * Muestra galeria, info del producto y formulario de agregar al carrito.
 */

'use client';

import type { Metadata } from 'next';
import { use } from 'react';
import { obtenerProductoPorId } from '@/services/producto.service';
import styles from './styles.module.css';
import CarritoAgregar from '@/components/carrito/carrito-agregar';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await obtenerProductoPorId(id);

  if (result.ok) {
    const producto = result.value;
    return {
      title: `${producto.nombre} | Tienda de Ropa`,
      description: producto.descripcion || `Detalle de ${producto.nombre}. Talle: ${producto.talle}.`,
    };
  }

  return {
    title: `Producto ${id} | Tienda de Ropa`,
    description: 'Detalle del producto seleccionado.',
  };
}

export default function ProductoDetallePage({ params }: Props) {
  const { id } = use(params);
  const result = use(obtenerProductoPorId(id));

  if (!result.ok) {
    return (
      <main className={styles.error}>
        <h1 className={styles.errorTitulo}>Producto no encontrado</h1>
        <p className={styles.errorMensaje}>
          El producto que buscas no existe o fue desactivado.
        </p>
        <a href="/productos" className={styles.botonVolver}>
          Volver al catalogo
        </a>
      </main>
    );
  }

  const producto = result.value;

  if (!producto.activo) {
    return (
      <main className={styles.error}>
        <h1 className={styles.errorTitulo}>Producto desactivado</h1>
        <p className={styles.errorMensaje}>
          Este producto ya no se encuentra disponible en nuestra tienda.
        </p>
      </main>
    );
  }

  return (
    <main className={styles.contenedor}>
      <section className={styles.galeria}>
        <DetalleProductoImagen
          nombre={producto.nombre}
          imagenes={producto.imagenes}
        />
      </section>
      <section className={styles.info}>
        <DetalleProductoInfo
          nombre={producto.nombre}
          talle={producto.talle}
          precioCentavos={producto.precioCentavos}
          descripcion={producto.descripcion}
          stock={producto.stock}
          productoId={producto.id}
        />
      </section>
    </main>
  );
}

function DetalleProductoImagen({ nombre, imagenes }: { nombre: string; imagenes: string[] }) {
  const imagenesMostrar = imagenes.length > 0 ? imagenes : [];
  const imagenPrincipal = imagenesMostrar[0] || '/placeholder.png';

  return (
    <>
      <img
        src={imagenPrincipal}
        alt={nombre}
        className={styles.imagenPrincipal}
      />
      {imagenesMostrar.length > 1 && (
        <div className={styles.thumbnails}>
          {imagenesMostrar.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${nombre} - Vista ${index + 1}`}
              className={styles.thumbnail}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DetalleProductoInfo({
  nombre,
  talle,
  precioCentavos,
  descripcion,
  stock,
  productoId,
}: {
  nombre: string;
  talle: string;
  precioCentavos: number;
  descripcion: string | null;
  stock: number;
  productoId: string;
}) {
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(precioCentavos / 100);

  return (
    <div className={styles.infoContenido}>
      <h1 className={styles.nombre}>{nombre}</h1>
      <span className={styles.talle}>Talle: {talle}</span>
      <p className={styles.precio}>{precioFormateado}</p>
      <hr className={styles.separador} />
      <p className={styles.descripcion}>
        {descripcion || 'Sin descripcion disponible.'}
      </p>

      <CarritoAgregar
        productoId={productoId}
        stockDisponible={stock}
      />
    </div>
  );
}