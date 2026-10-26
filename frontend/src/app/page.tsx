'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Wrench,
  Clock,
  MapPin,
  LogIn,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  ShoppingBag,
  Mail,
  Phone,
  RefreshCw,
  Store,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { formatIDR } from '@/lib/utils';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { useVisitorCounter } from '@/hooks/useVisitorCounter';
import StoreProfileCard from '@/components/StoreProfileCard';

export default function CatalogLandingPage() {
  // 1. Auto-increment website visitor counter on catalog landing
  useVisitorCounter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Fetch Categories & Initial Products
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          fetchCategories().catch(() => ({ data: [] })),
          fetchProducts().catch(() => ({ data: [] })),
        ]);
        setCategories(catsRes.data || []);
        setProducts(prodsRes.data || []);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Filter products based on category, search query, and stock toggle
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      product.categoryId === selectedCategory ||
      product.category?.slug === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAvailability = onlyAvailable ? product.isAvailable && product.stock > 0 : true;

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  // Direct WhatsApp inquiry without creating order entry (orders are recorded manually by admin upon deal)
  const handleDirectWhatsAppInquiry = (product: Product) => {
    const waUrl = generateWhatsAppOrderUrl(product.name, product.price);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F3F6F6] text-[#243238] flex flex-col selection:bg-[#064E5A] selection:text-white">
      {/* Top Banner Announcement */}
      <div className="bg-[#03262d] text-slate-300 text-xs py-2 px-4 border-b border-[#05424d]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#C66A0A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Katalog Resmi
            </span>
            <span className="text-slate-200 font-medium">
              Usaha Baru Cycle &bull; Bike Parts, Accessoris & Tukar Tambah
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#C66A0A]" />
              <span>Sel - Min: 08:00 - 17:00 WIB (Senin Tutup)</span>
            </span>
            <Link
              href="/login"
              className="flex items-center gap-1 text-[#94cbd5] hover:text-white font-medium transition"
            >
              <LogIn className="w-3.5 h-3.5" /> Login Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Store Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-md p-1 flex items-center justify-center group-hover:scale-105 transition transform overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo Usaha Baru Cycle"
                width={44}
                height={44}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div>
              <div className="font-extrabold text-xl sm:text-2xl text-[#243238] tracking-tight flex items-center gap-1.5">
                <span>USAHA BARU</span>
                <span className="text-[#064E5A]">CYCLE</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-semibold tracking-wide">
                Bike Parts &bull; Accessoris &bull; Tukar Tambah
              </p>
            </div>
          </Link>

          {/* Quick Contact & Store Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tokopedia Badge Link */}
            <a
              href="https://tokopedia.com/ubcycle"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 transition"
              title="Kunjungi Tokopedia Usaha Baru Cycle"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tokopedia</span>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </a>

            {/* Direct WhatsApp Inquiry */}
            <a
              href="https://wa.me/6281283301830?text=Halo%20Usaha%20Baru%20Cycle,%20saya%20ingin%20konsultasi%20seputar%20sepeda,%20spare%20part,%20atau%20layanan%20tukar%20tambah."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#064E5A] hover:bg-[#043d47] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-sm shadow-[#064E5A]/25"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp Toko</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03262d] via-[#064E5A] to-[#04343d] text-white py-14 sm:py-20 shadow-inner">
        {/* Subtle Background Glows matching the palette */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C66A0A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#064E5A]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-white">
            Pusat Sepeda & Spare Parts{' '}
            <span className="text-[#ecb778]">Usaha Baru Cycle</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#ddedf0] max-w-2xl mx-auto font-normal leading-relaxed">
            Temukan Mountain Bike (MTB), Sepeda Lipat, Road Bike, serta koleksi <strong>Bike Parts</strong> dan <strong>Accessoris</strong> original.
            Kami juga melayani <strong>Tukar Tambah</strong> sepeda langsung di Jakasampurna, Bekasi Barat.
          </p>

          {/* Quick Value Props (4 Cards from Photo 2) */}
          <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C66A0A]/30 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-[#f4d3a9]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Bike Parts</div>
                <div className="text-[11px] text-slate-300">Komponen Original</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C66A0A]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#f4d3a9]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Accessoris</div>
                <div className="text-[11px] text-slate-300">Perlengkapan Lengkap</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C66A0A]/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-[#f4d3a9]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Tukar Tambah</div>
                <div className="text-[11px] text-slate-300">Upgrade Sepeda Anda</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C66A0A]/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-[#f4d3a9]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Pesan via WhatsApp</div>
                <div className="text-[11px] text-slate-300">Respon Ramah & Cepat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section (Abu-abu kebiruan #F3F6F6 background) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243238] tracking-tight">
              Katalog Produk Pilihan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Jelajahi unit sepeda, komponen suku cadang, dan aksesoris resmi bergaransi.
            </p>
          </div>
          <div className="text-xs font-semibold text-[#064E5A] bg-[#ddedf0] px-3 py-1.5 rounded-lg border border-[#c0dfe4]">
            Menampilkan {filteredProducts.length} dari {products.length} Produk
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama sepeda, aksesoris, atau spare parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] text-sm bg-[#F3F6F6] text-[#243238] transition placeholder:text-slate-400"
              />
            </div>

            {/* Toggle Only Ready Stock */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#243238] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 text-[#064E5A] rounded border-slate-300 focus:ring-[#064E5A]"
                />
                <span>Hanya Tampilkan Stok Ready</span>
              </label>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#064E5A]" /> Kategori:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedCategory === 'all'
                ? 'bg-[#064E5A] text-white shadow-sm'
                : 'bg-[#F3F6F6] text-[#243238] hover:bg-slate-200'
                }`}
            >
              Semua Produk ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat.slug || selectedCategory === cat.id
                  ? 'bg-[#064E5A] text-white shadow-sm'
                  : 'bg-[#F3F6F6] text-[#243238] hover:bg-slate-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse h-96 flex flex-col justify-between shadow-sm"
              >
                <div className="w-full h-48 bg-slate-200 rounded-xl" />
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="h-10 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-sm">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#243238]">Tidak ada produk yang sesuai</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Coba ganti kata kunci pencarian atau pilih kategori lain untuk melihat koleksi Usaha Baru Cycle.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="mt-5 px-4 py-2 bg-[#064E5A] hover:bg-[#043d47] text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isStockReady = product.isAvailable && product.stock > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#064E5A]/40 transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Stock Status Badge */}
                  <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        product.imageUrl ||
                        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Stock Status Badge (Teal for ready) */}
                    <div className="absolute top-3 left-3">
                      {isStockReady ? (
                        <span className="inline-flex items-center gap-1 bg-[#064E5A]/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-[#f4d3a9]" /> Ready Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-600/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          <XCircle className="w-3 h-3" /> Stok Habis
                        </span>
                      )}
                    </div>

                    {/* Category Pill */}
                    {product.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-[#03262d]/85 backdrop-blur-md text-[#ddedf0] text-[10px] font-medium px-2 py-0.5 rounded-md">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#243238] text-base group-hover:text-[#064E5A] transition line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description || 'Spesifikasi standar pabrik original Usaha Baru Cycle.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        Harga Toko
                      </div>
                      {/* Price in Copper Orange #C66A0A (Warna aksen harga spesial) */}
                      <div className="text-xl font-extrabold text-[#C66A0A] tracking-tight">
                        {formatIDR(product.price)}
                      </div>

                      {/* Inquire / Order via WhatsApp Action Button */}
                      <button
                        onClick={() => handleDirectWhatsAppInquiry(product)}
                        className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm ${isStockReady
                          ? 'bg-[#064E5A] hover:bg-[#043d47] text-white shadow-[#064E5A]/20'
                          : 'bg-slate-800 hover:bg-slate-900 text-slate-200'
                          }`}
                      >
                        <MessageCircle className="w-4 h-4 text-[#ecb778]" />
                        <span>{isStockReady ? 'Inquire via WhatsApp' : 'Tanya Estimasi Restock'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* UMKM Profile & Store Features Showcase Card (Foto 2) */}
        {/* <StoreProfileCard /> */}
      </main>

      {/* Footer Section (Teal Gelap #064E5A background) */}
      <footer className="bg-[#03262d] text-slate-300 text-xs border-t border-[#05424d] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Store Brand & Logo */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-300/40 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Logo Usaha Baru Cycle"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-extrabold text-base tracking-tight">
                  USAHA BARU CYCLE
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Toko sepeda & penyedia Bike Parts, Accessoris terpercaya, serta melayani jasa Tukar Tambah
                sepeda di kawasan Bekasi dan sekitarnya.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://tokopedia.com/ubcycle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-[#ddedf0] text-[11px] font-semibold px-2.5 py-1 rounded-md transition"
                >
                  <Store className="w-3 h-3 text-[#ecb778]" /> Tokopedia Resmi
                </a>
              </div>
            </div>

            {/* Column 2: Alamat Lengkap Toko Fisik */}
            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Lokasi Toko Fisik
              </h4>
              <div className="space-y-2 text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C66A0A] shrink-0 mt-0.5" />
                  <span>
                    Jl. Assyafiiyah No.3A, RT.001/RW.018, Jakasampurna, Kec. Bekasi Bar., Kota Bks, Jawa Barat 17145, Indonesia
                  </span>
                </p>
                <a
                  href="https://maps.google.com/?q=Jl.+Assyafiiyah+No.3A,+RT.001/RW.018,+Jakasampurna,+Kec.+Bekasi+Bar.,+Kota+Bks,+Jawa+Barat+17145"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#94cbd5] hover:text-white font-medium pl-6"
                >
                  Lihat rute Google Maps &rarr;
                </a>
              </div>
            </div>

            {/* Column 3: Jam Operasional */}
            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Jam Operasional
              </h4>
              <div className="space-y-2 text-slate-300">
                <p className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#C66A0A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Selasa – Minggu:</strong><br />08:00 – 17:00 WIB
                  </span>
                </p>
                <p className="pl-6 text-rose-400 font-semibold text-[11px]">
                  Senin: Tutup (Closed)
                </p>
              </div>
            </div>

            {/* Column 4: Kontak Resmi & Admin */}
            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Kontak Resmi
              </h4>
              <div className="space-y-2 text-slate-300 text-xs">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C66A0A] shrink-0" />
                  <a href="https://wa.me/6281283301830" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    +62 812-8330-1830
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C66A0A] shrink-0" />
                  <a href="mailto:usahabarucycle.id@gmail.com" className="hover:text-white transition">
                    usahabarucycle.id@gmail.com
                  </a>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-[#064E5A] hover:bg-[#05424d] text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#ecb778]" />
                  <span>Masuk Dashboard Owner</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
            &copy; 2025 Usaha Baru Cycle. Sistem Informasi E-Katalog Digital UMKM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
