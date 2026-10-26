'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from '@/lib/api';
import { formatIDR } from '@/lib/utils';
import { Product, Category } from '@/types';
import CustomSelect, { SelectOption } from '@/components/CustomSelect';
import FeedbackModal from '@/components/FeedbackModal';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Feedback Modal State (replaces confirm() and alert())
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
    setFeedbackModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined }));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      if (cRes.data && cRes.data.length > 0 && !categoryId) {
        setCategoryId(cRes.data[0].id);
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setStock('1');
    setDescription('');
    setImageUrl('');
    setIsAvailable(true);
    setSelectedFile(null);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setDescription(prod.description || '');
    setImageUrl(prod.imageUrl);
    setIsAvailable(prod.isAvailable);
    setSelectedFile(null);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validasi ukuran maksimal 2MB
      const maxSizeBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        showAlert(
          'Ukuran File Terlalu Besar',
          `Ukuran file gambar maksimal 2MB. File yang Anda pilih berukuran ${sizeInMb}MB. Harap pilih file yang lebih kecil.`,
          'warning'
        );
        e.target.value = '';
        return;
      }

      setSelectedFile(file);

      // Instant upload ke server / storage
      const token = localStorage.getItem('ubc_token');
      if (!token) {
        showAlert('Sesi Berakhir', 'Sesi admin telah berakhir. Silakan login kembali.', 'warning');
        return;
      }

      try {
        setUploadingImage(true);
        const uploadedUrl = await uploadImage(token, file);
        setImageUrl(uploadedUrl);
      } catch (err: any) {
        showAlert('Gagal Mengunggah Foto', err.message || 'Terjadi kesalahan saat mengunggah foto produk.', 'danger');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    if (!name.trim() || !categoryId || !price || !imageUrl) {
      setErrorMsg('Nama produk, kategori, harga, dan foto produk wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      setErrorMsg('');

      const payload = {
        name: name.trim(),
        categoryId,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        description: description.trim(),
        imageUrl,
        isAvailable,
      };

      if (editingProduct) {
        await updateProduct(token, editingProduct.id, payload);
      } else {
        await createProduct(token, payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan produk.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    showConfirm(
      'Hapus Produk?',
      `Yakin ingin menghapus produk "${prodName}" dari katalog? Tindakan ini tidak dapat dibatalkan.`,
      'danger',
      async () => {
        setFeedbackModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteProduct(token, id);
          closeFeedbackModal();
          await loadData();
        } catch (err: any) {
          closeFeedbackModal();
          showAlert('Gagal Menghapus', err.message || 'Gagal menghapus produk dari katalog.', 'danger');
        }
      }
    );
  };

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Build category options for CustomSelect
  const categoryFilterOptions: SelectOption[] = [
    { value: 'all', label: 'Semua Kategori' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const categoryFormOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Feedback Modal (styled replacement for alert / confirm) */}
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
            Manajemen Produk &amp; Katalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tambah, ubah spesifikasi, kelola stok fisik, dan unggah foto sepeda via Vercel Blob.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#064E5A] hover:bg-[#043d47] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#064E5A]/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#064E5A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Styled CustomSelect for category filter */}
          <div className="w-48">
            <CustomSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryFilterOptions}
              placeholder="Semua Kategori"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Total: <span className="font-bold text-slate-800">{filtered.length}</span> item
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Foto</th>
                <th className="py-3 px-4 font-bold">Nama Produk</th>
                <th className="py-3 px-4 font-bold">Kategori</th>
                <th className="py-3 px-4 font-bold">Harga</th>
                <th className="py-3 px-4 font-bold">Stok</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Memuat katalog produk...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{prod.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {prod.category?.name || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#C66A0A] whitespace-nowrap">
                      {formatIDR(prod.price)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {prod.stock} unit
                    </td>
                    <td className="py-3 px-4">
                      {prod.isAvailable && prod.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#064E5A] font-semibold bg-[#ddedf0] px-2 py-0.5 rounded-full border border-[#c0dfe4]">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" /> Habis
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          title="Edit Produk"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          title="Hapus Produk"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              aria-label="Tutup modal"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              {editingProduct ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Isi informasi produk dengan lengkap untuk katalog Usaha Baru Cycle.
            </p>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Polygon Premier 5 MTB 27.5 inch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none text-xs transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  {/* Styled CustomSelect replacing native <select> */}
                  <CustomSelect
                    value={categoryId}
                    onChange={setCategoryId}
                    options={categoryFormOptions}
                    placeholder="Pilih Kategori..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 4950000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jumlah Stok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 5"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none text-xs transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Status Ketersediaan
                  </label>
                  <label className="flex items-center gap-2 mt-2.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 text-[#064E5A] rounded border-slate-300 focus:ring-[#064E5A]"
                    />
                    <span>Tampilkan sebagai Ready Stock</span>
                  </label>
                </div>
              </div>

              {/* Image Upload Integration */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Foto Produk <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-slate-700 font-semibold transition">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Gambar'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadingImage && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah foto...</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Format: <strong>JPG, PNG, WEBP</strong>. Maksimal ukuran: <strong>2MB</strong>.
                  </p>

                  {/* Manual URL input fallback */}
                  <input
                    type="url"
                    placeholder="Atau masukkan URL gambar langsung..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none"
                  />

                  {/* Preview */}
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border"
                      />
                      <span className="text-[11px] text-slate-500 truncate">{imageUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Deskripsi / Spesifikasi
                </label>
                <textarea
                  rows={3}
                  placeholder="Frame material, groupset, rem, garansi, dsb..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#064E5A] focus:border-[#064E5A] focus:outline-none text-xs transition resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingImage}
                  className="w-2/3 py-2.5 rounded-xl bg-[#064E5A] hover:bg-[#043d47] text-white font-bold transition shadow-md shadow-[#064E5A]/20 disabled:opacity-50 text-xs"
                >
                  {formLoading ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
