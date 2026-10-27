'use client';

import { useState, useEffect } from 'react';
import { useTransaction } from './context/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import DonutChart from '../components/DonutChart';
import BottomNav from '../components/BottomNav';

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  // State Data Supabase
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data dari Supabase saat user terautentikasi
  useEffect(() => {
    if (!user?.id) return;

    async function fetchTransactions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal mengambil data transaksi:', error.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }

    fetchTransactions();
  }, [user]);

  // Kalkulasi Keuangan Dinamis
  const totalPengeluaran = transactions.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  
  const kategoriStats = transactions.reduce((acc, item) => {
    const cat = item.category || 'Umum';
    acc[cat] = (acc[cat] || 0) + (Number(item.price) || 0);
    return acc;
  }, {});

  const dataChart = Object.keys(kategoriStats).map((catKey) => ({
    name: catKey,
    value: kategoriStats[catKey],
    display: `Rp${kategoriStats[catKey].toLocaleString('id-ID')}`,
  }));

  const filteredTransactions = selectedFilter === 'Semua'
    ? transactions
    : transactions.filter((item) => item.category === selectedFilter);

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Silakan masukkan ID Telegram kamu!');
    login({ id: telegramId, first_name: name || 'Pengguna' });
  };

  // Hitungan Prediksi Keuangan & Pola Boros (Taruh di dalam komponen Page)
const now = new Date();
const currentDay = now.getDate(); // Tanggal hari ini
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const remainingDays = daysInMonth - currentDay;

// Rata-rata pengeluaran per hari saat ini
const avgDailySpend = currentDay > 0 ? totalPengeluaran / currentDay : 0;

// Cari Kategori Terboros (Pola Boros)
let maxCategory = 'Belum ada';
let maxAmount = 0;
Object.keys(kategoriStats).forEach((cat) => {
  if (kategoriStats[cat] > maxAmount) {
    maxAmount = kategoriStats[cat];
    maxCategory = cat;
  }
});
const persentaseBoros = totalPengeluaran > 0 ? Math.round((maxAmount / totalPengeluaran) * 100) : 0;

// Estimasi Tanggal Uang Habis (Asumsi saldo awal misal Rp1.500.000)
const SALDO_AWAL = 1500000;
const sisaSaldoReal = SALDO_AWAL - totalPengeluaran;
const estHariBertahan = avgDailySpend > 0 ? Math.floor(sisaSaldoReal / avgDailySpend) : remainingDays;
const estTanggalHabis = Math.min(daysInMonth, currentDay + estHariBertahan);

  const handleLogout = () => {
    window.location.reload();
  };

  // ==========================================
  // TAMPILAN 1: HALAMAN LOGIN (SESUAI WIREFRAME)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
        <div className="bg-white p-7 rounded-3xl shadow-sm w-full max-w-sm text-center border border-gray-300">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Dashboard Keuangan</h1>
          <p className="mb-6 text-gray-500 text-xs px-2 leading-relaxed">
            Masukkan ID Telegram kamu untuk mengakses catatan keuangan
          </p>
          
          <form onSubmit={handleManualLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                ID Telegram (Wajib)
              </label>
              <input
                type="number"
                placeholder="Contoh: 12345"
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-gray-600 text-xs text-gray-800 placeholder-gray-400"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Nama Panggilan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi"
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-gray-600 text-xs text-gray-800 placeholder-gray-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-neutral-800 text-white font-medium p-3 rounded-xl hover:bg-neutral-900 transition-colors mt-2 text-xs"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs font-medium text-gray-800 mb-3">
              Belum pernah catat pengeluaran?
            </p>
            <a 
              href="https://t.me/softdevkeuanganbot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-gray-200 text-gray-800 font-bold p-3 rounded-xl border border-gray-300 hover:bg-gray-300 transition-colors text-xs flex items-center justify-center gap-2"
            >
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

  // ==========================================
  // TAMPILAN 2: DASBOR UTAMA 
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto relative pb-24 shadow-xl font-sans text-gray-900">
      <div className="bg-white min-h-screen p-5 pb-20">
        
        {/* Top Bar User Info & Logout */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-xs text-gray-500">Selamat Datang,</h2>
            <p className="text-sm font-bold text-gray-800">{user.first_name} ({user.id})</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
          >
            Keluar
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-xl font-bold">Oktober 2026</h1>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <p className="text-xs text-gray-500">Pengeluaran Bulan Ini</p>
                <h2 className="text-3xl font-extrabold my-1 text-gray-900">
                  Rp{totalPengeluaran.toLocaleString('id-ID')}
                </h2>
                <p className="text-[11px] text-gray-400">{transactions.length} Transaksi Tercatat</p>
              </div>

              {/* Grafik Donat Dinamis */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">Pengeluaran per kategori</h3>
                {dataChart.length > 0 ? (
                  <DonutChart customData={dataChart} />
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada transaksi recorded.</p>
                )}
              </div>

              {/* Transaksi Terakhir (3 Terbaru) */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">Transaksi terakhir</h3>
                  <button onClick={() => setActiveTab('riwayat')} className="text-xs text-gray-500">Lihat semua</button>
                </div>

                {loading ? (
                  <p className="text-xs text-gray-400">Memuat data...</p>
                ) : transactions.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-xs font-bold">{item.title}</p>
                      <p className="text-[10px] text-gray-500">{item.category} · Telegram</p>
                    </div>
                    <span className="text-xs font-bold">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 2: RIWAYAT */}
          {activeTab === 'riwayat' && (
            <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-2xl font-bold mb-2">Riwayat Transaksi</h1>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Makanan & Minuman', 'Transportasi', 'Kuliah', 'Hiburan'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-1.5 rounded-full border transition-colors ${
                      selectedFilter === cat
                        ? 'bg-neutral-800 text-white border-neutral-800'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List Transaksi Filtered */}
              <div className="space-y-2 pt-2">
                {filteredTransactions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">Tidak ada data transaksi.</p>
                ) : (
                  filteredTransactions.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
                      <div>
                        <p className="text-xs font-bold">{item.title}</p>
                        <p className="text-[10px] text-gray-500">{item.category}</p>
                      </div>
                      <span className="text-xs font-bold">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}