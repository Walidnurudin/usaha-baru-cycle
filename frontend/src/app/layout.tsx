import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toko Sepeda Usaha Baru Cycle | E-Katalog Digital & Toko Sepeda Terlengkap',
  description:
    'Katalog online resmi Toko Sepeda Usaha Baru Cycle. Temukan berbagai sepeda gunung (MTB), sepeda lipat, road bike, spare parts, dan aksesoris original bergaransi dengan pemesanan langsung via WhatsApp.',
  keywords: [
    'Toko Sepeda',
    'Usaha Baru Cycle',
    'E-Katalog Sepeda',
    'Sepeda Gunung',
    'Sepeda Lipat',
    'Spare Parts Sepeda',
    'Bicycle Catalog',
  ],
  authors: [{ name: 'Usaha Baru Cycle' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
