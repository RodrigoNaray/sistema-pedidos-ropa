import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    default: 'Tienda de Ropa',
    template: '%s | Tienda de Ropa',
  },
  description: 'Explora nuestra coleccion de ropa con estilo y calidad. Pedidos faciles por transferencia bancaria.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${lora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}