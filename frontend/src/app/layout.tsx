import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Usaha Baru Cycle | Toko Sepeda, Bike Parts, Accessoris & Tukar Tambah',
  description:
    'Katalog online resmi Usaha Baru Cycle. Melayani penjualan sepeda, bike parts, accessoris berkualitas, dan layanan tukar tambah di Jakasampurna, Bekasi Barat. Hubungi WA: +62 812-8330-1830.',
  keywords: [
    'Usaha Baru Cycle',
    'Toko Sepeda Bekasi',
    'Bike Parts Bekasi',
    'Aksesoris Sepeda',
    'Tukar Tambah Sepeda',
    'Sepeda Gunung MTB',
    'Sepeda Lipat',
    'Jakasampurna Bekasi Barat',
  ],
  authors: [{ name: 'Usaha Baru Cycle' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
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
