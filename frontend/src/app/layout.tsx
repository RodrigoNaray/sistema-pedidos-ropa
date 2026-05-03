import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-commerce - Tienda de Ropa',
  description: 'Tienda de ropa online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}