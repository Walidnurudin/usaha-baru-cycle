'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bike,
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
} from 'lucide-react';
import { Product, Category } from '@/types';
import { fetchProducts, fetchCategories, submitOrder } from '@/lib/api';
import { formatIDR } from '@/lib/utils';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { useVisitorCounter } from '@/hooks/useVisitorCounter';

export default function CatalogLandingPage() {
  // 1. Auto-increment website visitor counter on catalog landing
  useVisitorCounter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Modal State for Inquire / Order
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  const handleOpenOrderModal = (product: Product) => {
    setActiveModalProduct(product);
    setOrderSuccess(false);
  };

  const handleCloseModal = () => {
    setActiveModalProduct(null);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setOrderSuccess(false);
  };

  const handleConfirmWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProduct || !customerName.trim() || !customerPhone.trim()) {
      alert('Harap lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    try {
      setSubmittingOrder(true);
      // 1. Record inquiry/order to backend database
      await submitOrder({
        customerName,
        customerWa: customerPhone,
        productName: activeModalProduct.name,
        totalAmount: Number(activeModalProduct.price),
        notes: orderNotes || undefined,
      }).catch((err) => {
        console.warn('Backend order recording note:', err.message);
      });

      setOrderSuccess(true);

      // 2. Open WhatsApp with pre-formatted message
      const waUrl = generateWhatsAppOrderUrl(activeModalProduct.name, activeModalProduct.price);
      setTimeout(() => {
        window.open(waUrl, '_blank');
        handleCloseModal();
      }, 700);
    } catch (err: any) {
      alert('Gagal memproses pesanan: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Announcement */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Katalog Digital
            </span>
            <span>Toko Sepeda Usaha Baru Cycle - Melayani Pembelian Sepeda & Spare Parts Original</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Buka: 08.00 - 18.00 WIB
            </span>
            <Link
              href="/login"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              <LogIn className="w-3.5 h-3.5" /> Login Admin UMKM
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Store Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition transform">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>USAHA BARU</span>
                <span className="text-emerald-600">CYCLE</span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Katalog Sepeda & Komponen UMKM
              </p>
            </div>
          </Link>

          {/* Contact Direct WhatsApp */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Usaha%20Baru%20Cycle,%20saya%20ingin%20bertanya%20seputar%20sepeda%20dan%20servis."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Konsultasi WA</span>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <span>Dashboard Admin</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-24">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Informasi E-Katalog Digital Resmi UMKM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Pilihan Sepeda & Spare Parts Berkualitas di{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Usaha Baru Cycle
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Katalog terlengkap: Mountain Bike (MTB), Sepeda Lipat, Road Bike, hingga komponen resmi.
            Cek ketersediaan stok real-time dan pesan langsung terhubung ke WhatsApp toko.
          </p>

          {/* Quick Value Props */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">100% Original</div>
                <div className="text-[11px] text-slate-400">Garansi Pabrikan</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Stok Real-Time</div>
                <div className="text-[11px] text-slate-400">Pembaruan Rutin</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Pesan WhatsApp</div>
                <div className="text-[11px] text-slate-400">Respon Cepat</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Bengkel Servis</div>
                <div className="text-[11px] text-slate-400">Mekanik Handal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama sepeda, tipe, atau spare part..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50 transition"
              />
            </div>

            {/* Toggle Only Ready Stock */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>Hanya Tampilkan Stok Ready</span>
              </label>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Kategori:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Produk ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.slug || selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse h-96 flex flex-col justify-between"
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
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Tidak ada produk yang sesuai</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Coba ganti kata kunci pencarian atau pilih kategori lain untuk melihat koleksi sepeda
              Usaha Baru Cycle.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
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
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col group"
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

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isStockReady ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          <CheckCircle2 className="w-3 h-3" /> Ready Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          <XCircle className="w-3 h-3" /> Stok Habis
                        </span>
                      )}
                    </div>

                    {/* Category Pill */}
                    {product.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description || 'Spesifikasi standar pabrik original Usaha Baru Cycle.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-400 font-medium">Harga Resmi Toko</div>
                      <div className="text-lg font-extrabold text-emerald-700 tracking-tight">
                        {formatIDR(product.price)}
                      </div>

                      {/* Inquire / Order via WhatsApp Action Button */}
                      <button
                        onClick={() => handleOpenOrderModal(product)}
                        className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm ${
                          isStockReady
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-slate-100'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-300" />
                        <span>{isStockReady ? 'Inquire via WhatsApp' : 'Tanya Estimasi Restock'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* WhatsApp Order / Inquiry Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Pesan via WhatsApp</h3>
                <p className="text-xs text-slate-500">Toko Sepeda Usaha Baru Cycle</p>
              </div>
            </div>

            {/* Selected Product Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
              <img
                src={activeModalProduct.imageUrl}
                alt={activeModalProduct.name}
                className="w-16 h-16 object-cover rounded-xl border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {activeModalProduct.name}
                </h4>
                <div className="text-xs font-semibold text-emerald-700">
                  {formatIDR(activeModalProduct.price)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Status: {activeModalProduct.stock > 0 ? `Ready (${activeModalProduct.stock} unit)` : 'Stok Kosong'}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmWhatsAppOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Anda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp Anda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Apakah bisa sekalian pasang aksesoris atau COD di toko?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Message Preview Requirement Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-slate-700">
                <span className="font-bold text-emerald-800 block mb-1">Pesan Otomatis WhatsApp:</span>
                <p className="italic text-slate-600 bg-white/80 p-2 rounded border border-emerald-100 font-mono text-[11px]">
                  &quot;Halo Usaha Baru Cycle, saya tertarik dengan {activeModalProduct.name} seharga{' '}
                  {formatIDR(activeModalProduct.price)}. Apakah stok masih ada?&quot;
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{submittingOrder ? 'Menghubungkan...' : 'Lanjut ke WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Bike className="w-5 h-5 text-emerald-500" />
                <span>USAHA BARU CYCLE</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Toko sepeda & penyedia suku cadang terpercaya. Melayani penjualan unit baru, spare
                parts original, serta jasa servis profesional.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Lokasi Toko Fisik
              </h4>
              <p className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Jl. Raya Sepeda No. 88, Jawa Timur, Indonesia</span>
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Jam Operasional
              </h4>
              <p className="flex items-start gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Senin - Sabtu: 08.00 - 18.00 WIB<br />Minggu: 08.00 - 15.00 WIB</span>
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">
                Akses Pemilik UMKM
              </h4>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masuk Dashboard Owner</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-slate-500">
            &copy; 2025 Toko Sepeda Usaha Baru Cycle. Sistem Informasi E-Katalog Digital UMKM.
          </div>
        </div>
      </footer>
    </div>
  );
}
