'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Plus,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  ChevronDown,
  Check,
  Wrench,
} from 'lucide-react';
import {
  fetchAdminOrders,
  createManualOrder,
  deleteOrder,
  fetchProducts,
} from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';
import { generateCustomerContactUrl } from '@/lib/whatsapp';
import { Order, Product } from '@/types';
import FeedbackModal from '@/components/FeedbackModal';

function OrderManagementContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Feedback Modal State (replaces confirm() / alert())
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    isConfirm: boolean;
    onConfirm?: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    isConfirm: false,
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'danger' | 'warning' | 'info' | 'success' = 'info'
  ) => {
    setFeedbackModal({ isOpen: true, title, message, type, isConfirm: false });
  };

  const showConfirm = (
    title: string,
    message: string,
    type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
    onConfirm: () => void
  ) => {
    setFeedbackModal({ isOpen: true, title, message, type, isConfirm: true, onConfirm });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined, isLoading: false }));
  };

  // Modal State for Manual Order Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerWa, setFormCustomerWa] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('custom');
  const [formProductName, setFormProductName] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formTotalAmount, setFormTotalAmount] = useState<number | string>('');
  const [formDeductStock, setFormDeductStock] = useState<boolean>(false);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Custom Styled Product Dropdown State
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    }
    if (isProductDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductDropdownOpen]);

  // Auto open modal if action=new in query params
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const loadOrders = async () => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetchAdminOrders(token, {
        search: search.trim() || undefined,
      });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load catalog products for dropdown
  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setCatalogProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products for manual order modal:', err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleDeleteOrder = (orderId: string, customerName: string) => {
    showConfirm(
      'Hapus Pesanan?',
      `Apakah Anda yakin ingin menghapus pesanan atas nama "${customerName}"? Data yang dihapus tidak dapat dikembalikan.`,
      'danger',
      async () => {
        const token = localStorage.getItem('ubc_token');
        if (!token) { closeFeedbackModal(); return; }
        setFeedbackModal((prev) => ({ ...prev, isLoading: true }));
        try {
          setDeletingId(orderId);
          await deleteOrder(token, orderId);
          setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
          closeFeedbackModal();
        } catch (err: any) {
          closeFeedbackModal();
          showAlert('Gagal Menghapus', 'Gagal menghapus pesanan: ' + err.message, 'danger');
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  // Handle Product Selection Change in Custom Dropdown
  const handleProductSelectionChange = (productId: string) => {
    setSelectedProductId(productId);
    setFormError(null);

    if (productId === 'custom') {
      setFormProductName('');
      setFormUnitPrice(0);
      setFormTotalAmount('');
      setFormDeductStock(false);
    } else {
      const prod = catalogProducts.find((p) => p.id === productId);
      if (prod) {
        const price = Number(prod.price) || 0;
        setFormProductName(prod.name);
        setFormUnitPrice(price);
        setFormTotalAmount(price * formQuantity);
        setFormDeductStock(prod.stock > 0);
      }
    }
  };

  // Handle Quantity Change in Modal
  const handleQuantityChange = (qty: number) => {
    const safeQty = Math.max(1, qty);
    setFormQuantity(safeQty);
    if (selectedProductId !== 'custom' && formUnitPrice > 0) {
      setFormTotalAmount(formUnitPrice * safeQty);
    }
  };

  const handleOpenCreateModal = () => {
    setFormCustomerName('');
    setFormCustomerWa('');
    setSelectedProductId('custom');
    setFormProductName('');
    setFormUnitPrice(0);
    setFormQuantity(1);
    setFormTotalAmount('');
    setFormDeductStock(false);
    setFormNotes('');
    setFormError(null);
    setIsProductDropdownOpen(false);
    setProductSearchQuery('');
    setIsModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsModalOpen(false);
    setIsProductDropdownOpen(false);
    setFormError(null);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formCustomerName.trim()) {
      setFormError('Nama pelanggan wajib diisi.');
      return;
    }
    if (!formCustomerWa.trim()) {
      setFormError('Nomor WhatsApp pelanggan wajib diisi.');
      return;
    }
    if (!formProductName.trim()) {
      setFormError('Nama produk/layanan transaksi wajib diisi.');
      return;
    }
    if (formTotalAmount === '' || Number(formTotalAmount) < 0) {
      setFormError('Total nominal pesanan tidak valid.');
      return;
    }

    const token = localStorage.getItem('ubc_token');
    if (!token) {
      setFormError('Sesi login telah berakhir. Harap login kembali.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createManualOrder(token, {
        customerName: formCustomerName.trim(),
        customerWa: formCustomerWa.trim(),
        productName: formProductName.trim(),
        productId: selectedProductId !== 'custom' ? selectedProductId : undefined,
        quantity: formQuantity,
        deductStock: selectedProductId !== 'custom' && formDeductStock,
        totalAmount: Number(formTotalAmount),
        status: 'COMPLETED',
        notes: formNotes.trim() || undefined,
      });

      handleCloseCreateModal();
      await loadOrders();
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Styled Feedback Modal (replaces browser confirm/alert) */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        title={feedbackModal.title}
        message={feedbackModal.message}
        type={feedbackModal.type}
        isConfirm={feedbackModal.isConfirm}
        confirmText={feedbackModal.isConfirm ? 'Ya, Hapus' : 'Mengerti'}
        cancelText="Batal"
        isLoading={feedbackModal.isLoading}
        onClose={closeFeedbackModal}
        onConfirm={feedbackModal.onConfirm}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pesanan & Transaksi Selesai
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar pesanan riil yang telah disepakati (deal/lunas) melalui WhatsApp atau transaksi langsung toko Usaha Baru Cycle.
          </p>
        </div>

        {/* Action Button: Input Pesanan Manual */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-[#064E5A] hover:bg-[#043d47] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#064E5A]/20 transition"
        >
          <Plus className="w-4 h-4 text-[#ecb778]" />
          <span>Catat Pesanan Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, no WA, item produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#064E5A]"
          />
        </form>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>
            Total: <strong>{orders.length}</strong> Transaksi Selesai
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu Transaksi</th>
                <th className="py-3 px-4 font-bold">Nama Pelanggan</th>
                <th className="py-3 px-4 font-bold">Nomor WhatsApp</th>
                <th className="py-3 px-4 font-bold">Item Produk / Layanan</th>
                <th className="py-3 px-4 font-bold">Total Nilai</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div>Belum ada pesanan yang tercatat.</div>
                    <button
                      onClick={handleOpenCreateModal}
                      className="mt-3 text-xs font-bold text-[#064E5A] hover:underline"
                    >
                      + Catat pesanan pertama sekarang
                    </button>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const replyUrl = generateCustomerContactUrl(
                    ord.customerWa,
                    ord.customerName,
                    ord.productName
                  );

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {ord.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        +{ord.customerWa}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-sm font-medium">
                        <div className="truncate font-semibold">{ord.productName}</div>
                        {ord.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {ord.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#C66A0A] whitespace-nowrap">
                        {formatIDR(ord.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={replyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#ddedf0] hover:bg-[#c0dfe4] text-[#064E5A] text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[#acd3db] transition shadow-sm"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#064E5A]" />
                            <span>WA</span>
                          </a>
                          <button
                            type="button"
                            disabled={deletingId === ord.id}
                            onClick={() => handleDeleteOrder(ord.id, ord.customerName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Input Pesanan Manual (Deal WhatsApp) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={handleCloseCreateModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#ddedf0] text-[#064E5A] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#243238] text-lg">Catat Pesanan Baru</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Input pesanan yang sudah deal/bayar via WhatsApp atau langsung di toko.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              {/* Custom Styled Product Dropdown Selector */}
              <div className="relative" ref={productDropdownRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Pilih Produk Katalog
                </label>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition shadow-sm ${isProductDropdownOpen
                      ? 'border-[#064E5A] ring-2 ring-[#064E5A]/20 bg-white'
                      : 'border-slate-300 bg-[#F8FAFA] hover:bg-white hover:border-slate-400'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {selectedProductId === 'custom' ? (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-[#ddedf0] text-[#064E5A] flex items-center justify-center shrink-0 shadow-sm">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800">
                            Input Kustom (Tukar Tambah / Servis / Lainnya)
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Transaksi non-katalog atau gabungan
                          </div>
                        </div>
                      </>
                    ) : (
                      (() => {
                        const prod = catalogProducts.find((p) => p.id === selectedProductId);
                        if (!prod) return null;
                        return (
                          <>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {prod.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-[#C66A0A]">
                                  {formatIDR(prod.price)}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${prod.stock > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                    }`}
                                >
                                  {prod.stock > 0 ? `Stok: ${prod.stock}` : 'Stok Habis'}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isProductDropdownOpen ? 'rotate-180 text-[#064E5A]' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu Panel */}
                {isProductDropdownOpen && (
                  <div className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Inner Search Box */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Cari produk katalog..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                      {/* Option 1: Custom Option */}
                      <button
                        type="button"
                        onClick={() => {
                          handleProductSelectionChange('custom');
                          setIsProductDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition ${selectedProductId === 'custom'
                            ? 'bg-[#ddedf0]/80 text-[#064E5A]'
                            : 'hover:bg-slate-100 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#064E5A] flex items-center justify-center shrink-0">
                            <Wrench className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">
                              Input Kustom (Tukar Tambah / Servis / Lainnya)
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Transaksi non-katalog atau gabungan
                            </div>
                          </div>
                        </div>
                        {selectedProductId === 'custom' && (
                          <Check className="w-4 h-4 text-[#064E5A] shrink-0" />
                        )}
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      {/* Filtered Catalog Products */}
                      {catalogProducts
                        .filter((p) =>
                          p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                        )
                        .map((p) => {
                          const isSelected = selectedProductId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleProductSelectionChange(p.id);
                                setIsProductDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition ${isSelected
                                  ? 'bg-[#ddedf0]/80 text-[#064E5A]'
                                  : 'hover:bg-slate-100 text-slate-800'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                  {p.imageUrl ? (
                                    <img
                                      src={p.imageUrl}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">{p.name}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-bold text-[#C66A0A]">
                                      {formatIDR(p.price)}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.stock > 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                        }`}
                                    >
                                      {p.stock > 0 ? `${p.stock} ready` : 'Habis'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[#064E5A] shrink-0" />
                              )}
                            </button>
                          );
                        })}

                      {catalogProducts.filter((p) =>
                        p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                      ).length === 0 && (
                          <div className="text-center py-4 text-xs text-slate-400">
                            Tidak ada produk yang cocok dengan pencarian.
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Name (Custom or Display) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Item / Transaksi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sepeda Lipat Pacific Noris 2.0 / Servis Sepeda"
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none bg-white text-slate-900"
                />
              </div>

              {/* Quantity and Total Price in Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jumlah (Qty)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Nominal (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="Contoh: 2500000"
                    value={formTotalAmount}
                    onChange={(e) => setFormTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#C66A0A] focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Auto Deduct Stock Checkbox (Only if catalog product selected) */}
              {selectedProductId !== 'custom' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <input
                    type="checkbox"
                    id="deductStockCheck"
                    checked={formDeductStock}
                    onChange={(e) => setFormDeductStock(e.target.checked)}
                    className="w-4 h-4 text-[#064E5A] rounded border-amber-300 focus:ring-[#064E5A]"
                  />
                  <label htmlFor="deductStockCheck" className="font-semibold cursor-pointer">
                    Otomatis kurangi stok produk di katalog sebanyak {formQuantity} unit
                  </label>
                </div>
              )}

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Pelanggan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp Pelanggan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081283301830"
                    value={formCustomerWa}
                    onChange={(e) => setFormCustomerWa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Transaksi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Deal via WA, lunas via transfer BCA, ambil di toko Jakasampurna."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none resize-none bg-white text-slate-900"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-xl bg-[#064E5A] hover:bg-[#043d47] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#064E5A]/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#ecb778]" />
                      <span>Simpan Transaksi Selesai</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Memuat manajemen pesanan...
        </div>
      }
    >
      <OrderManagementContent />
    </Suspense>
  );
}
