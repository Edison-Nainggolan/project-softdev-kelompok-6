'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import TelegramLogin from '../components/TelegramLogin';
import Dashboard from '../components/Dashboard'; // Import komponen Sheet/Drawer kamu

export default function Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (telegramUser) => {
    setUser(telegramUser);
    setLoading(true);

    // Memicu pencarian data berdasarkan Telegram ID user
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Gagal mengambil data:', error);
    setLoading(false);
  };

  // Tampilan 1: Jika user belum Login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-2">Money Management Softdev</h1>
        <p className="mb-6 text-gray-600">Silakan login dengan Telegram untuk melihat catatanmu.</p>
        
        {/* Tombol Login Telegram */}
        <TelegramLogin botName="softdevkeuanganbot" onAuth={handleLogin} />
      </div>
    );
  }

  // Tampilan 2: Jika user sudah Login
  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Halo, {user.first_name}! 👋</h1>
          <p className="text-sm text-gray-500">ID Telegram: {user.id}</p>
        </div>

        {/* Memanggil Tombol Drawer/Sheet Ringkasan Keuangan dari components/Dashboard.js */}
        <Dashboard />
      </div>

      {/* Konten Utama Dashboard / Tabel Transaksi */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        <p className="text-sm text-gray-500">
          Kirim pesan pengeluaran ke bot Telegram kamu untuk mencatat transaksi baru secara otomatis.
        </p>
      </div>
    </main>
  );
}