'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus } from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';
import { generateCustomerContactUrl } from '@/lib/whatsapp';
import { Order, OrderStatus } from '@/types';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetchAdminOrders(token, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    try {
      setUpdatingId(orderId);
      await updateOrderStatus(token, orderId, newStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus as OrderStatus } : ord))
      );
    } catch (err: any) {
      alert('Gagal mengubah status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pesanan & Inquiry Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar calon pembeli dan pesanan yang masuk melalui WhatsApp katalog Usaha Baru Cycle.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pelanggan, no WA, produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="INQUIRY">INQUIRY (Tanya Stok)</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED (Disetujui)</option>
            <option value="COMPLETED">COMPLETED (Selesai/Lunas)</option>
            <option value="CANCELLED">CANCELLED (Batal)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu Masuk</th>
                <th className="py-3 px-4 font-bold">Nama Pelanggan</th>
                <th className="py-3 px-4 font-bold">Nomor WhatsApp</th>
                <th className="py-3 px-4 font-bold">Item Produk</th>
                <th className="py-3 px-4 font-bold">Total Nilai</th>
                <th className="py-3 px-4 font-bold">Status Pesanan</th>
                <th className="py-3 px-4 font-bold text-right">Hubungi Pelanggan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Belum ada inquiry atau pesanan yang tercatat.
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
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium">
                        {ord.productName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#C66A0A] whitespace-nowrap">
                        {formatIDR(ord.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          disabled={updatingId === ord.id}
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="INQUIRY">INQUIRY</option>
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <a
                          href={replyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#ddedf0] hover:bg-[#c0dfe4] text-[#064E5A] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#acd3db] transition shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#064E5A]" />
                          <span>Balas di WA</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
