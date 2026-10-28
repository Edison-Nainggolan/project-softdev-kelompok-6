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

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saldoAwal, setSaldoAwal] = useState(1500000);
  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [inputSaldo, setInputSaldo] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const savedSaldo = localStorage.getItem(`saldo_awal_${user.id}`);
    if (savedSaldo) {
      setSaldoAwal(Number(savedSaldo));
    }

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

  const handleSaveSaldo = (e) => {
    e.preventDefault();
    const nominal = Number(inputSaldo);
    if (isNaN(nominal) || nominal < 0) return alert('Masukkan nominal angka yang valid!');
    
    setSaldoAwal(nominal);
    localStorage.setItem(`saldo_awal_${user.id}`, nominal);
    setIsEditingSaldo(false);
    setInputSaldo('');
  };

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

  const now = new Date();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sisaHari = Math.max(1, totalDaysInMonth - now.getDate() + 1);

  const totalPengeluaran = transactions.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const sisaSaldo = saldoAwal - totalPengeluaran;
  const amanJajanHariIni = sisaSaldo > 0 ? Math.floor(sisaSaldo / sisaHari) : 0;

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

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const hariIniList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === todayStr);
  const kemarinList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === yesterdayStr);
  const sebelumnyaList = filteredTransactions.filter(item => {
    const d = new Date(item.created_at).toDateString();
    return d !== todayStr && d !== yesterdayStr;
  });

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
    <div className="min-h-screen bg-gray-100 w-full max-w-7xl mx-auto relative pb-24 shadow-xl font-sans text-gray-900">
      <div className="bg-white min-h-screen p-6 md:p-10 pb-24">
        
        {/* Header User */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xs text-gray-500">Selamat Datang,</h2>
            <p className="text-base md:text-lg font-bold text-gray-800">{user.first_name} ({user.id})</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg border border-red-200 transition-colors">
            Keluar
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ================= TAB 1: HOME ================= */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold">Oktober 2026</h1>

              {/* Grid 3 Kartu Ringkasan (Melebar Penuh di Laptop) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 font-medium">Aman jajan hari ini</p>
                  <h2 className="text-3xl lg:text-4xl font-extrabold my-2 text-gray-900">
                    Rp{amanJajanHariIni.toLocaleString('id-ID')}
                  </h2>
                  <p className="text-xs text-gray-400">{sisaHari} hari lagi dalam bulan ini</p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 font-medium">Pengeluaran bulan ini</p>
                  <p className="text-3xl lg:text-4xl font-extrabold my-2 text-gray-900">Rp{totalPengeluaran.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-400">{transactions.length} transaksi tercatat</p>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5 relative">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-medium">Sisa saldo</p>
                    <button 
                      onClick={() => { setInputSaldo(saldoAwal); setIsEditingSaldo(true); }}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Atur Saldo
                    </button>
                  </div>
                  <p className="text-3xl lg:text-4xl font-extrabold my-2 text-gray-900">Rp{sisaSaldo.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-400">Total awal: Rp{saldoAwal.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Layout 2 Kolom untuk Laptop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
                  <h3 className="text-base font-bold mb-4">Pengeluaran per kategori</h3>
                  <DonutChart customData={dataChart} />
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold">Transaksi terakhir</h3>
                    <button onClick={() => setActiveTab('riwayat')} className="text-xs text-blue-600 font-semibold hover:underline">Lihat semua</button>
                  </div>

                  {loading ? (
                    <p className="text-xs text-gray-400">Memuat data...</p>
                  ) : transactions.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">Belum ada data transaksi bulan ini.</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0">
                          <div>
                            <p className="text-xs md:text-sm font-bold text-gray-800">{item.title}</p>
                            <p className="text-[11px] text-gray-500">{item.category} · Telegram</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs md:text-sm font-bold text-gray-900">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                            <button onClick={() => handleDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: RIWAYAT ================= */}
          {activeTab === 'riwayat' && (
            <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
                {transactions.length > 0 && (
                  <button onClick={handleResetData} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200">
                    🗑️ Reset Data
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Makanan & Minuman', 'Transportasi', 'Kuliah', 'Hiburan', 'Umum'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      selectedFilter === cat ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {hariIniList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3">Hari ini</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hariIniList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
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

                {kemarinList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3">Kemarin</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {kemarinList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
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

                {sebelumnyaList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3">Sebelumnya</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sebelumnyaList.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
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
                  <p className="text-xs text-gray-400 text-center py-8">Tidak ada riwayat transaksi.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: BUDGET ================= */}
          {activeTab === 'budget' && (
            <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Budget</h1>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Total Terpakai Bulan Ini</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Rp{totalPengeluaran.toLocaleString('id-ID')}</h2>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden my-2">
                  <div className="bg-gray-800 h-3 rounded-full" style={{ width: `${Math.min(100, Math.round((totalPengeluaran / saldoAwal) * 100))}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-5">
                {Object.keys(BUDGET_LIMITS).map((catName) => {
                  const spent = kategoriStats[catName] || 0;
                  const limit = BUDGET_LIMITS[catName];
                  const percent = Math.min(100, Math.round((spent / limit) * 100));

                  return (
                    <div key={catName}>
                      <div className="flex justify-between text-xs md:text-sm font-bold text-gray-900 mb-2">
                        <span>{catName}</span>
                        <span className="text-gray-500 font-normal">Rp{spent.toLocaleString('id-ID')} / Rp{limit.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className={`h-3 rounded-full ${percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-amber-500' : 'bg-gray-800'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 4: INSIGHT ================= */}
          {activeTab === 'insight' && (
            <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Insight</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-3">
                  <p className="text-xs text-gray-600 font-medium">Ringkasan mingguan</p>
                  <p className="text-xs md:text-sm text-gray-800 font-medium leading-relaxed">
                    Total pengeluaran bulan ini mencapai <strong className="text-gray-900">Rp{totalPengeluaran.toLocaleString('id-ID')}</strong>.
                  </p>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563' }} />
                        <Tooltip formatter={(val) => `Rp${Math.round(val).toLocaleString('id-ID')}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-3 flex flex-col justify-center">
                  <p className="text-xs text-gray-600 font-medium">Prediksi Sisa Saldo</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    {sisaSaldo > 0 ? 'Uang Cukup Aman' : 'Uang Kritis!'}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
                    Sisa saldo kamu adalah <strong>Rp{sisaSaldo.toLocaleString('id-ID')}</strong>. Batas aman jajan harianmu hingga akhir bulan adalah <strong>Rp{amanJajanHariIni.toLocaleString('id-ID')}/hari</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* MODAL EDIT SALDO AWAL */}
        {isEditingSaldo && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-left space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-gray-900">Atur Uang Kiriman / Saldo Awal</h3>
              <p className="text-xs text-gray-500">Masukkan nominal total uang sakumu untuk bulan ini.</p>
              <form onSubmit={handleSaveSaldo} className="space-y-3">
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={inputSaldo}
                  onChange={(e) => setInputSaldo(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-gray-800"
                  required
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSaldo(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-900"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}