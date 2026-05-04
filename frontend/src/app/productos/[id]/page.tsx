import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Producto ${id} | Tienda de Ropa`,
    description: 'Detalle del producto seleccionado.',
  };
}

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params;
  return (
    <main>
      <h1>Detalle del Producto</h1>
      <p>ID: {id}</p>
    </main>
  );
}