import React from 'react';
import Image from 'next/image';
import {
  Phone,
  Store,
  ExternalLink,
  Wrench,
  Clock,
  MapPin,
  Navigation,
} from 'lucide-react';

interface StoreProfileCardProps {
  className?: string;
}

export default function StoreProfileCard({ className = 'mt-16' }: StoreProfileCardProps) {
  return (
    <section className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm ${className}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-200 shadow-md p-2 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="Usaha Baru Cycle Logo"
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <span className="inline-block bg-[#ddedf0] text-[#064E5A] text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
              Bicycle Shop & Workshop
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#243238] tracking-tight">
              Usaha Baru Cycle
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Spesialis Bike Parts, Accessoris, dan Layanan Tukar Tambah Sepeda di Bekasi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://wa.me/6281283301830?text=Halo%20Usaha%20Baru%20Cycle,%20saya%20ingin%20tanya%20layanan%20tukar%20tambah%20dan%20spare%20part."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#064E5A] hover:bg-[#043d47] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-[#064E5A]/20"
          >
            <Phone className="w-4 h-4 text-[#ecb778]" />
            <span>+62 812-8330-1830</span>
          </a>

          <a
            href="https://tokopedia.com/ubcycle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-emerald-200 transition"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Tokopedia Toko</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </a>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#064E5A] uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-[#C66A0A]" />
            <span>Layanan Utama</span>
          </div>
          <p className="text-sm font-semibold text-[#243238]">
            Bike Parts &bull; Accessoris &bull; Tukar Tambah
          </p>
          <p className="text-xs text-slate-500">
            Penyediaan komponen sepeda original, perakitan, dan tukar tambah berbagai tipe sepeda.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#064E5A] uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#C66A0A]" />
            <span>Jam Buka Toko</span>
          </div>
          <p className="text-sm font-semibold text-[#243238]">
            Selasa – Minggu: 08:00 – 17:00 WIB
          </p>
          <p className="text-xs text-rose-600 font-semibold">
            Senin: Tutup (Closed)
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#064E5A] uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#C66A0A]" />
            <span>Lokasi Toko Fisik</span>
          </div>
          <p className="text-xs text-[#243238] font-medium leading-relaxed">
            Jl. Assyafiiyah No.3A, RT.001/RW.018, Jakasampurna, Kec. Bekasi Bar., Kota Bks, Jawa Barat 17145
          </p>
          <a
            href="https://maps.google.com/?q=Jl.+Assyafiiyah+No.3A,+RT.001/RW.018,+Jakasampurna,+Kec.+Bekasi+Bar.,+Kota+Bks,+Jawa+Barat+17145"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#064E5A] hover:underline pt-0.5"
          >
            <Navigation className="w-3 h-3 text-[#C66A0A]" />
            <span>Petunjuk Arah Google Maps &rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export { StoreProfileCard as UmkmProfileCard };
