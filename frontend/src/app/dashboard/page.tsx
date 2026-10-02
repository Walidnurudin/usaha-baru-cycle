'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Eye,
  TrendingUp,
  ArrowRight,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';
import { DashboardStats } from '@/types';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const token = localStorage.getItem('ubc_token');
      if (!token) return;

      try {
        setLoading(true);
        const res = await getDashboardStats(token);
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Pemilik Usaha Baru Cycle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan data produk, pesanan pelanggan via WhatsApp, dan performa lalu lintas website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Laporan PDF</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Metric Stat Cards + Total Omset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1: Total Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalProducts || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Sepeda, spare parts, & aksesoris</div>
          </div>
        </div>

        {/* Stat Card 2: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalOrders || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Inquiry WhatsApp & pemesanan</div>
          </div>
        </div>

        {/* Stat Card 3: Total Website Visits (Visitor Counter) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Kunjungan Web
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats?.totalWebsiteVisits || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Visitor counter otomatis katalog</div>
          </div>
        </div>

        {/* Stat Card 4: Total Revenue (Completed & Confirmed) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Omset Terkonfirmasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-tight">
              {loading ? '...' : formatIDR(stats?.totalRevenue || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Status Confirmed & Completed</div>
          </div>
        </div>
      </div>

      {/* Recent Orders / Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-800">Inquiry & Pesanan Terbaru</h2>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>Lihat Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu</th>
                <th className="py-3 px-4 font-bold">Nama Pelanggan</th>
                <th className="py-3 px-4 font-bold">No. WhatsApp</th>
                <th className="py-3 px-4 font-bold">Produk</th>
                <th className="py-3 px-4 font-bold">Total Nilai</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat pesanan terbaru...
                  </td>
                </tr>
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {ord.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono">
                      {ord.customerWa}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium">
                      {ord.productName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 whitespace-nowrap">
                      {formatIDR(ord.totalAmount)}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada inquiry atau pesanan yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
