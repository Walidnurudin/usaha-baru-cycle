'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bike,
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin Usaha Baru Cycle');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ubc_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const savedUser = localStorage.getItem('ubc_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.name) setAdminName(parsed.name);
      } catch (e) {
        // ignore
      }
    }
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('ubc_token');
    localStorage.removeItem('ubc_user');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Ringkasan Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Katalog & Produk', href: '/dashboard/products', icon: Package },
    { name: 'Pesanan & WhatsApp', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Laporan Penjualan (PDF)', href: '/dashboard/reports', icon: FileText },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memverifikasi otorisasi admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#03262d] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#05424d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="Usaha Baru Cycle" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">Usaha Baru Cycle</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#03262d] text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col justify-between border-r border-[#05424d] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-[#05424d]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <Image src="/logo.png" alt="Usaha Baru Cycle" width={38} height={38} className="object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-base leading-tight tracking-tight">
                  USAHA BARU
                </h1>
                <p className="text-[11px] text-[#ecb778] font-bold tracking-wider uppercase">
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#064E5A] text-white shadow-md shadow-[#064E5A]/40 border-l-4 border-[#C66A0A]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ecb778]' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-[#05424d] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-300 hover:text-[#ecb778] px-3 py-2 rounded-lg hover:bg-white/5 transition font-medium"
          >
            <span>Katalog Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between bg-[#04343d] p-3 rounded-xl border border-[#064E5A]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C66A0A]/20 text-[#ecb778] flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{adminName}</div>
                <div className="text-[10px] text-[#ecb778]">Owner UMKM</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
