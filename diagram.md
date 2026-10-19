flowchart TD
    Start([Mulai]) --> RoleSelection{Pengguna}

    %% Alur Pengunjung
    RoleSelection -->|Pengunjung / Pelanggan| Catalog[Buka Halaman Katalog]
    Catalog --> Browse[Filter Kategori & Cari Produk]
    Browse --> Detail[Lihat Detail & Harga Sepeda]
    Detail --> OrderWA[Klik 'Beli via WhatsApp']
    OrderWA --> WhatsAppDirect[Direct ke WhatsApp Toko dengan Template Pesan]

    %% Alur Admin
    RoleSelection -->|Pemilik Toko / Admin| Login[Masuk Halaman Login]
    Login --> AuthCheck{Autentikasi Valid?}
    AuthCheck -->|Tidak| LoginFail[Muncul Pesan Error] --> Login
    AuthCheck -->|Ya| Dashboard[Masuk Dashboard Admin]
    
    Dashboard --> ProductMgmt[Kelola Produk: Tambah / Edit / Hapus]
    Dashboard --> OrderMgmt[Monitor Status Pesanan WhatsApp]
    Dashboard --> ReportPDF[Filter Periode & Unduh Laporan PDF]

    WhatsAppDirect --> Selesai([Selesai])
    ReportPDF --> Selesai
