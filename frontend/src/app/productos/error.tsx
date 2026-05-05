'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error('Error al cargar productos:', error);
  }, [error]);

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, sans-serif',
      color: 'var(--color-error)',
      gap: 'var(--space-md)',
    }}>
      <h1>Hubo un error</h1>
      <p>No se pudieron cargar los productos. Intenta nuevamente.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          padding: 'var(--space-sm) var(--space-md)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </main>
  );
}