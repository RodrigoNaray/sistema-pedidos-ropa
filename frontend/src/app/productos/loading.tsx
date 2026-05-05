export default function Loading() {
  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, sans-serif',
      color: 'var(--color-text-secondary)',
    }}>
      Cargando productos...
    </main>
  );
}