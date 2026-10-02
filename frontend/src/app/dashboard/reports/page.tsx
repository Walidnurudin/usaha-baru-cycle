'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  ShoppingBag,
  CheckCircle,
  Loader2,
  Printer,
} from 'lucide-react';
import { fetchAdminOrders, downloadSalesReportPdf } from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function SalesReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Date Range Defaults (Default: First day of current month to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const loadReportData = async () => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetchAdminOrders(token, {
        startDate,
        endDate,
      });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadReportData();
  };

  const handleExportPdf = async () => {
    const token = localStorage.getItem('ubc_token');
    if (!token) return;

    try {
      setDownloading(true);
      await downloadSalesReportPdf(token, startDate, endDate);
    } catch (err: any) {
      alert('Gagal mengunduh laporan PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Calculations
  const totalTransactions = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Penjualan & Ekspor PDF
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi penjualan Usaha Baru Cycle berdasarkan rentang tanggal dan unduh dokumen resmi PDF.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={downloading || orders.length === 0}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50 self-start sm:self-auto"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Dokumen PDF Resmi</span>
            </>
          )}
        </button>
      </div>

      {/* Date Range Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Dari Tanggal (Mulai)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Sampai Tanggal (Selesai)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Terapkan Filter
          </button>
        </form>
      </div>

      {/* Summary Metrics for Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Pesanan Masuk</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {totalTransactions} Pesanan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pada rentang tanggal yang dipilih</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Pesanan Selesai (Lunas)</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">
            {completedOrders.length} Pesanan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Status COMPLETED</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Omset Penjualan</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {formatIDR(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed + Completed</div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Rincian Transaksi ({orders.length} baris)
          </h2>
          <span className="text-[11px] text-slate-500">
            Periode: {startDate} s/d {endDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Tanggal</th>
                <th className="py-3 px-4 font-bold">Pelanggan</th>
                <th className="py-3 px-4 font-bold">No. WhatsApp</th>
                <th className="py-3 px-4 font-bold">Produk</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Nilai Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada transaksi pada rentang tanggal ini.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {ord.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      +{ord.customerWa}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium">
                      {ord.productName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 text-right whitespace-nowrap">
                      {formatIDR(ord.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
