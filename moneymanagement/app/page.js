'use client';

import { useState } from 'react';
import { useTransaction } from './context/TransactionContext';
import Dashboard from '../components/Dashboard';

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Silakan masukkan ID Telegram!');
    
    login({
      id: telegramId,
      first_name: name || 'Pengguna',
    });
  };

  // Tampilan 1: Jika BELUM login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2 text-blue-600">Dashboard Keuangan</h1>
          <p className="mb-6 text-gray-500 text-sm">Masukkan ID Telegram kamu untuk mengakses catatan keuangan.</p>
          
          <form onSubmit={handleManualLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Telegram (Wajib)</label>
              <input
                type="number"
                placeholder="Contoh: 123456789"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Edison"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white font-semibold p-2 rounded-lg hover:bg-blue-600 transition-colors mt-2"
            >
              Masuk ke Dashboard
            </button>
          </form>

          {/* INFO AKSES BOT DITAMBAHKAN DI SINI */}
          <div className="mt-6 border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Belum pernah catat pengeluaran?</p>
            <a 
              href="https://t.me/softdevkeuanganbot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full bg-green-50 text-green-600 font-semibold p-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              🤖 Mulai Chat Bot Telegram
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            *Kirim pesan ke bot <strong>@userinfobot</strong> di Telegram untuk mengetahui ID kamu.
          </p>
        </div>
      </div>
    );
  }

  // Tampilan 2: Jika SUDAH login
  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">Halo, {user.first_name}! 👋</h1>
          <p className="text-sm text-gray-500">ID Telegram: {user.id}</p>
        </div>
        
        <div className="flex gap-2">
          {/* TOMBOL PINTASAN KE BOT DARI DALAM DASHBOARD */}
          <a 
            href="https://t.me/softdevkeuanganbot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold flex items-center justify-center"
          >
            🤖 Catat Baru
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold"
          >
            Keluar
          </button>
        </div>
      </div>
      <Dashboard />
    </main>
  );
}