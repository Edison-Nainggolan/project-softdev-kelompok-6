'use client';

import { useState, useEffect } from 'react';
import { useTransaction } from './context/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import DonutChart from '../components/DonutChart';
import BottomNav from '../components/BottomNav';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const BUDGET_LIMITS = {
  'Makanan & Minuman': 700000,
  'Makan': 700000,
  'Transportasi': 200000,
  'Transport': 200000,
  'Kuliah': 300000,
  'Hiburan': 150000,
  'Umum': 300000,
};

const SALDO_AWAL_BULAN = 1500000; // Contoh total kiriman/saldo bulanan

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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
        console.error('Gagal mengambil data:', error.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }

    fetchTransactions();
  }, [user]);

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleResetData = async () => {
    if (!confirm('⚠️ Reset semua data transaksi secara permanen?')) return;
    const { error } = await supabase.from('transactions').delete().eq('telegram_id', user.id);
    if (!error) {
      setTransactions([]);
      alert('Data berhasil di-reset!');
    }
  };

  // Kalkulasi Keuangan
  const totalPengeluaran = transactions.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const sisaSaldo = SALDO_AWAL_BULAN - totalPengeluaran;

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

  // Filter Riwayat
  const filteredTransactions = selectedFilter === 'Semua'
    ? transactions
    : transactions.filter((item) => item.category === selectedFilter);

  // Grouping Tanggal untuk Riwayat
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const hariIniList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === todayStr);
  const kemarinList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === yesterdayStr);
  const sebelumnyaList = filteredTransactions.filter(item => {
    const d = new Date(item.created_at).toDateString();
    return d !== todayStr && d !== yesterdayStr;
  });

  // Data Grafik Mingguan untuk Insight
  const weeklyData = [
    { day: 'Sen', amount: totalPengeluaran * 0.15 },
    { day: 'Sel', amount: totalPengeluaran * 0.1 },
    { day: 'Rab', amount: totalPengeluaran * 0.25 },
    { day: 'Kam', amount: totalPengeluaran * 0.1 },
    { day: 'Jum', amount: totalPengeluaran * 0.2 },
    { day: 'Sab', amount: totalPengeluaran * 0.15 },
    { day: 'Min', amount: totalPengeluaran * 0.05 },
  ];

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Masukkan ID Telegram!');
    login({ id: telegramId, first_name: name || 'Pengguna' });
  };

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

  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto relative pb-24 shadow-xl font-sans text-gray-900">
      <div className="bg-white min-h-screen p-5 pb-20">
        
        {/* Header User */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-xs text-gray-500">Selamat Datang,</h2>
            <p className="text-sm font-bold text-gray-800">{user.first_name} ({user.id})</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200">
            Keluar
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ================= TAB 1: HOME ================= */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-xl font-bold">Oktober 2026</h1>

              {/* Aman Jajan Hari Ini */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <p className="text-xs text-gray-500 font-medium">Aman jajan hari ini</p>
                <h2 className="text-3xl font-extrabold my-1 text-gray-900">Rp50.000</h2>
                <p className="text-[11px] text-gray-400">10 hari lagi sampai kiriman (5 Nov)</p>
              </div>

              {/* Grid: Pengeluaran Bulan Ini & Sisa Saldo[cite: 11] */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-3.5">
                  <p className="text-[11px] text-gray-500 font-medium">Pengeluaran bulan ini</p>
                  <p className="text-base font-bold text-gray-900 mt-1">Rp{totalPengeluaran.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-3.5">
                  <p className="text-[11px] text-gray-500 font-medium">Sisa saldo</p>
                  <p className="text-base font-bold text-gray-900 mt-1">Rp{sisaSaldo.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">Pengeluaran per kategori</h3>
                <DonutChart customData={dataChart} />
              </div>

              {/* Transaksi Terakhir */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                      <button onClick={() => handleDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500 p-1">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: RIWAYAT (Dikelompokkan Berdasarkan Tanggal) ================= */}
          {activeTab === 'riwayat' && (
            <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
                {transactions.length > 0 && (
                  <button onClick={handleResetData} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200">
                    🗑️ Reset Data
                  </button>
                )}
              </div>

              {/* Filter Kategori */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Makanan & Minuman', 'Transportasi', 'Kuliah', 'Hiburan', 'Umum'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-1.5 rounded-full border transition-colors ${
                      selectedFilter === cat ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                {/* Hari Ini */}
                {hariIniList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">Hari ini</p>
                    <div className="space-y-2">
                      {hariIniList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.title}</p>
                            <p className="text-[10px] text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-900">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                            <button onClick={() => handleDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kemarin */}
                {kemarinList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">Kemarin</p>
                    <div className="space-y-2">
                      {kemarinList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.title}</p>
                            <p className="text-[10px] text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-900">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                            <button onClick={() => handleDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sebelumnya */}
                {sebelumnyaList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">Sebelumnya</p>
                    <div className="space-y-2">
                      {sebelumnyaList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.title}</p>
                            <p className="text-[10px] text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-900">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                            <button onClick={() => handleDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredTransactions.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Tidak ada riwayat transaksi.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: BUDGET ================= */}
          {activeTab === 'budget' && (
            <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Budget</h1>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Total Terpakai Bulan Ini</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Rp{totalPengeluaran.toLocaleString('id-ID')}</h2>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden my-2">
                  <div className="bg-gray-800 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.round((totalPengeluaran / 1650000) * 100))}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-4">
                {Object.keys(BUDGET_LIMITS).map((catName) => {
                  const spent = kategoriStats[catName] || 0;
                  const limit = BUDGET_LIMITS[catName];
                  const percent = Math.min(100, Math.round((spent / limit) * 100));

                  return (
                    <div key={catName}>
                      <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                        <span>{catName}</span>
                        <span className="text-gray-500 font-normal">Rp{spent.toLocaleString('id-ID')} / Rp{limit.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-amber-500' : 'bg-gray-800'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 4: INSIGHT (Dilengkapi Grafik & Peringatan) ================= */}
          {activeTab === 'insight' && (
            <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Insight</h1>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-3">
                <p className="text-xs text-gray-600 font-medium">Ringkasan mingguan</p>
                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                  Total pengeluaran bulan ini mencapai <strong className="text-gray-900">Rp{totalPengeluaran.toLocaleString('id-ID')}</strong>. Berikut grafik tren mingguan kamu:
                </p>

                {/* Grafik Batang Recharts */}
                <div className="h-32 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563' }} />
                      <Tooltip formatter={(val) => `Rp${Math.round(val).toLocaleString('id-ID')}`} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peringatan & Prediksi */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-gray-600 font-medium">Prediksi sampai kiriman</p>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {sisaSaldo > 0 ? 'Uang cukup aman' : 'Uang kritis!'}
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Sisa perkiraan saldo kamu saat ini adalah Rp{sisaSaldo.toLocaleString('id-ID')}.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}