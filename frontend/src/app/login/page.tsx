'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginAdmin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });
      if (res.data?.token) {
        localStorage.setItem('ubc_token', res.data.token);
        localStorage.setItem('ubc_user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03262d] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience with Palette Colors */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C66A0A]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#064E5A]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 flex items-center justify-center group-hover:scale-105 transition transform">
            <Image
              src="/logo.png"
              alt="Logo Usaha Baru Cycle"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold text-white tracking-tight">
              USAHA BARU <span className="text-[#ecb778]">CYCLE</span>
            </div>
            <div className="text-xs text-[#ddedf0]">Portal Pemilik UMKM</div>
          </div>
        </Link>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Login Dashboard Owner
        </h2>
        <p className="mt-2 text-center text-xs text-[#ddedf0]">
          Kelola katalog sepeda & parts, pantau pesanan WhatsApp, dan unduh laporan penjualan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#04343d]/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-[#064E5A] sm:px-10">
          {errorMsg && (
            <div className="mb-5 bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="masukkan email anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#03262d] border border-[#064E5A] text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C66A0A] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#03262d] border border-[#064E5A] text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C66A0A] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#064E5A] hover:bg-[#05424d] text-white font-bold text-sm shadow-lg shadow-[#064E5A]/30 transition disabled:opacity-50 border border-[#0d6b7b]"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#ecb778]" />
            </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-[#064E5A]">
            <Link
              href="/"
              className="text-xs text-[#ddedf0] hover:text-white transition flex items-center justify-center gap-1 font-medium"
            >
              &larr; Kembali ke Katalog Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
