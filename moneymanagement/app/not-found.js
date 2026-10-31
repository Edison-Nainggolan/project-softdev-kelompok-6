'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-gray-500 mb-4">Halaman yang kamu cari tidak ada atau telah dipindahkan.</p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-neutral-800 text-white text-xs font-semibold rounded-xl hover:bg-neutral-900 transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}