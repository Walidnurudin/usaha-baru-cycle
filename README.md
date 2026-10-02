# 🚴 Sistem Informasi E-Katalog Digital UMKM
### Studi Kasus: Toko Sepeda Usaha Baru Cycle (Capstone Project)

Sistem Informasi E-Katalog Digital dan Rekapitulasi Penjualan berbasis Web untuk UMKM Toko Sepeda Usaha Baru Cycle. Sistem ini memungkinkan pelanggan melihat katalog sepeda & spare parts secara real-time, memesan langsung melalui WhatsApp, serta memberikan dashboard analitik, manajemen produk, dan ekspor laporan penjualan resmi dalam format PDF untuk pemilik toko.

---

## 🛠️ Tech Stack & Arsitektur
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend API**: Express.js, TypeScript (Separated REST API)
- **Database & ORM**: PostgreSQL (Hosted on [Neon.tech](https://neon.tech)) & Prisma ORM
- **Cloud Storage**: Vercel Blob Storage (`@vercel/blob`)
- **Reporting Engine**: jsPDF & jsPDF-AutoTable
- **Deployment**: Vercel (Frontend & Serverless Backend) + Neon.tech (PostgreSQL)

---

## 📁 Struktur Direktori
```
e-katalog/
├── backend/
│   ├── api/index.ts            # Serverless handler for Vercel
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma PostgreSQL models (User, Category, Product, Order, VisitorLog)
│   │   └── seed.ts             # Seeder data (Admin, Categories, Products, Visits)
│   ├── src/
│   │   ├── config/             # Prisma & Environment config
│   │   ├── controllers/        # Auth, Product, Order, Upload (Vercel Blob), Analytics
│   │   ├── middlewares/        # JWT Auth & Error handlers
│   │   ├── routes/             # Express API v1 routes
│   │   ├── services/           # jsPDF Sales Report generator
│   │   ├── app.ts              # Express App setup
│   │   └── server.ts           # Local listener
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                # Public E-Catalog Landing Page (+ Visitor Counter + WA Drawer)
    │   │   ├── login/page.tsx          # MSME Admin Login Page
    │   │   └── dashboard/
    │   │       ├── page.tsx            # Dashboard Overview (Stat Cards: Products, Orders, Visits, Omset)
    │   │       ├── products/page.tsx   # Product CRUD with Vercel Blob Image Upload
    │   │       ├── orders/page.tsx     # Inquiries & WhatsApp Order Manager
    │   │       └── reports/page.tsx    # Sales Report with Date Filter & PDF Export
    │   ├── hooks/                      # useVisitorCounter
    │   ├── lib/                        # api client, utils, whatsapp url generator
    │   └── types/                      # TypeScript interfaces
    ├── .env.example
    └── package.json
```

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### 1. Setup Backend (`/backend`)
1. Buka direktori backend:
   ```bash
   cd backend
   npm install
   ```
2. Salin environment variable:
   ```bash
   cp .env.example .env
   ```
   *Isi `DATABASE_URL` dan `DIRECT_URL` dari dashboard Neon.tech Anda.*
3. Generate Prisma client dan jalankan migrasi database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Jalankan seeder database:
   ```bash
   npm run prisma:seed
   ```
   *Akun Admin Default:*
   - **Email**: `admin@usahabarucycle.com`
   - **Password**: `AdminSepeda123!`
5. Jalankan server backend:
   ```bash
   npm run dev
   ```
   *Backend aktif di `http://localhost:5000`.*

---

### 2. Setup Frontend (`/frontend`)
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Salin environment variable:
   ```bash
   cp .env.example .env.local
   ```
3. Jalankan server Next.js:
   ```bash
   npm run dev
   ```
   *Katalog publik aktif di `http://localhost:3000`.*

---

## 🌐 Alur Pengujian Fitur Utama

1. **Pengunjung Publik (Pelanggan)**:
   - Akses `http://localhost:3000`.
   - Visitor counter otomatis bertambah (+1) ke database `/api/v1/analytics/visit`.
   - Telusuri sepeda gunung, sepeda lipat, atau spare parts menggunakan fitur filter dan pencarian.
   - Klik **"Inquire via WhatsApp"**. Form modal akan terbuka dan menghasilkan link WhatsApp dengan pesan otomatis:
     > *"Halo Usaha Baru Cycle, saya tertarik dengan [Product Name] seharga [Price]. Apakah stok masih ada?"*

2. **Pemilik Toko (Admin UMKM)**:
   - Akses `http://localhost:3000/login` dan gunakan akun admin default.
   - Masuk ke **Ringkasan Dashboard** (`/dashboard`) untuk melihat metrik:
     - Total Produk
     - Total Pesanan
     - Total Kunjungan Web (Visitor Counter)
     - Total Omset Terkonfirmasi
   - Masuk ke **Katalog & Produk** (`/dashboard/products`) untuk melakukan CRUD produk serta mengunggah foto sepeda ke Vercel Blob.
   - Masuk ke **Pesanan** (`/dashboard/orders`) untuk mengubah status (Inquiry, Pending, Confirmed, Completed) dan membalas chat WhatsApp pelanggan.
   - Masuk ke **Laporan Penjualan (PDF)** (`/dashboard/reports`) untuk memfilter periode tanggal dan mengunduh berkas laporan resmi PDF bertanda tangan digital toko.

---

## ☁️ Panduan Deploy ke Vercel & Neon.tech

1. **Database**: Buat database PostgreSQL di [Neon.tech](https://neon.tech), salin **Pooled Connection String** sebagai `DATABASE_URL` dan **Direct Connection String** sebagai `DIRECT_URL`.
2. **Storage**: Buat storage **Vercel Blob** di Vercel Dashboard, salin `BLOB_READ_WRITE_TOKEN`.
3. **Backend Deploy**: Deploy folder `/backend` ke Vercel sebagai Web Project / Serverless API, pasang Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`).
4. **Frontend Deploy**: Deploy folder `/frontend` ke Vercel, pasang Environment Variable `NEXT_PUBLIC_API_URL` mengarah ke URL backend Vercel Anda (misal `https://api-usaha-baru-cycle.vercel.app/api/v1`).
