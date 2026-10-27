'use client';

import { useState } from 'react';
import { useTransaction } from './context/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';
import DonutChart from '../components/DonutChart';
import BottomNav from '../components/BottomNav';

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Masukkan ID Telegram kamu!');
    login({ id: telegramId, first_name: name || 'Pengguna' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center border border-gray-200">
          <h1 className="text-2xl font-bold text-brand mb-1">Dashboard Keuangan</h1>
          <p className="text-gray-500 text-xs mb-6">Masukkan ID Telegram kamu untuk mengakses catatan.</p>

          <form onSubmit={handleManualLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ID Telegram (Wajib)</label>
              <input
                type="number"
                placeholder="Contoh: 12345"
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-brand text-sm"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-hover text-white font-semibold p-3 rounded-xl transition-colors text-sm mt-2"
            >
              Masuk ke Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tertiary max-w-md mx-auto relative pb-24 shadow-xl font-sans text-gray-900">
      <div className="bg-white min-h-screen p-5 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-xl font-bold">Oktober 2026</h1>

              <div className="bg-tertiary border border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-500">Aman jajan hari ini</p>
                <h2 className="text-3xl font-extrabold my-1 text-brand">Rp50.000</h2>
                <p className="text-[11px] text-gray-400">10 hari lagi sampai kiriman</p>
              </div>

              <div className="bg-tertiary border border-gray-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">Pengeluaran per kategori</h3>
                <DonutChart />
              </div>
            </motion.div>
          )}

          {activeTab === 'riwayat' && (
            <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
              <p className="text-xs text-gray-500">Daftar transaksi aktif akan tampil di sini.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}