import Image from 'next/image';
import Link from 'next/link';
import styles from './tarjeta-producto.module.css';

interface TarjetaProductoProps {
  id: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  imagenes: string[];
}

export default function TarjetaProducto({ id, nombre, talle, precioCentavos, imagenes }: TarjetaProductoProps) {
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(precioCentavos / 100);

  return (
    <Link href={`/productos/${id}`} className={styles.container}>
      <Image
        src={imagenes[0] || '/placeholder.png'}
        alt={nombre}
        className={styles.imagen}
        width={400}
        height={240}
      />
      <div className={styles.contenido}>
        <h3 className={styles.nombre}>{nombre}</h3>
        <span className={styles.talle}>Talle: {talle}</span>
        <p className={styles.precio}>{precioFormateado}</p>
      </div>
    </Link>
  );
}
