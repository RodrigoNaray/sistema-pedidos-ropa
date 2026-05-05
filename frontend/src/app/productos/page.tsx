import { obtenerProductosActivos } from '@/services/producto.service';
import TarjetaProducto from '@/components/client/tarjeta-producto';
import Loading from './loading';
import Error from './error';

export const metadata = {
  title: 'Productos | Tienda de Ropa',
  description: 'Catalogo completo de productos de ropa.',
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; tamano?: string; talle?: string }>;
}) {
  const params = await searchParams;
  const tamano = Number(params.tamano) || 12;
  const pagina = Number(params.pagina) || 1;

  const result = await obtenerProductosActivos({
    activo: true,
    talle: params.talle,
    pagina,
    tamano,
  });

  if (!result.ok) {
    return <Error error={result.error} />;
  }

  const { productos, total } = result.value;

  if (productos.length === 0) {
    return (
      <main>
        <h1>Productos</h1>
        <p>No se encontraron productos.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Productos</h1>
      <section>
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-lg)',
        }}>
          {productos.map((producto) => (
            <li key={producto.id} style={{ margin: 0 }}>
              <TarjetaProducto
                id={producto.id}
                nombre={producto.nombre}
                talle={producto.talle}
                precioCentavos={producto.precioCentavos}
                imagenes={producto.imagenes}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}