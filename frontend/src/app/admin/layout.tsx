import type { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
      <h1>Panel de Administracion</h1>
      {children}
    </main>
  );
}
