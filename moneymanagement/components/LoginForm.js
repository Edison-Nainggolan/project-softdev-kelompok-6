'use client';

import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Masukkan ID Telegram!');
    onLogin({ id: telegramId, first_name: name || 'Pengguna' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <div className="bg-white p-7 rounded-3xl shadow-sm w-full max-w-sm text-center border border-gray-300">
        <img src="/logo.png" alt="FinTraces Logo" className="w-12 h-12 mx-auto mb-3 object-contain rounded-xl" />
        <h1 className="text-2xl font-bold mb-1 text-gray-900">Dashboard Keuangan</h1>
        <p className="mb-6 text-gray-500 text-xs px-2 leading-relaxed">
          Masukkan ID Telegram kamu untuk mengakses catatan keuangan
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">ID Telegram (Wajib)</label>
            <input
              type="number"
              placeholder="Contoh: 12345"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-gray-600 text-xs text-gray-800"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">Nama Panggilan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Budi"
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-gray-600 text-xs text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-neutral-800 text-white font-medium p-3 rounded-xl hover:bg-neutral-900 transition-colors text-xs">
            Masuk ke Dashboard
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-xs font-medium text-gray-800 mb-3">Belum pernah catat pengeluaran?</p>
          <a href="https://t.me/softdevkeuanganbot" target="_blank" rel="noopener noreferrer" className="w-full bg-gray-200 text-gray-800 font-bold p-3 rounded-xl border border-gray-300 hover:bg-gray-300 transition-colors text-xs flex items-center justify-center gap-2">
            ⚙️ Mulai Chat Bot Telegram
          </a>
        </div>
        <p className="text-[11px] text-gray-400 mt-4 leading-tight">
          *Kirim pesan ke bot <strong className="font-semibold text-gray-600">@userinfobot</strong> di Telegram untuk mengetahui ID kamu
        </p>
      </div>
    </div>
  );
}