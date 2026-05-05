import type { Metadata } from 'next';
import { obtenerProductoPorId } from '@/services/producto.service';
import styles from './styles.module.css';

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

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params;
  const result = await obtenerProductoPorId(id);

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
          activo={producto.activo}
          stock={producto.stock}
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
  activo,
  stock,
}: {
  nombre: string;
  talle: string;
  precioCentavos: number;
  descripcion: string | null;
  activo: boolean;
  stock: number;
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
      {activo && stock > 0 && (
        <button className={styles.botonCarrito} disabled>
          Agregar al carrito (Pronto)
        </button>
      )}
      {!activo && <p className={styles.inactivo}>Producto desactivado</p>}
      {activo && stock === 0 && (
        <p className={styles.inactivo}>Agotado - Sin stock disponible</p>
      )}
    </div>
  );
}