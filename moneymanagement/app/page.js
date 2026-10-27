'use client';

import { useState } from 'react';
import { useTransaction } from './context/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from 'recharts';

// Data dummy sesuai Wireframe Hipster
const dataKategoriDonut = [
  { name: 'Makan', value: 595000, display: 'Rp595.000', color: '#6B7280' },
  { name: 'Transport', value: 80000, display: 'Rp80.000', color: '#9CA3AF' },
  { name: 'Kuliah', value: 165000, display: 'Rp165.000', color: '#D1D5DB' },
  { name: 'Hiburan', value: 155000, display: 'Rp155.000', color: '#E5E7EB' },
];

const dataMingguanInsight = [
  { day: 'S', amount: 35 },
  { day: 'S', amount: 20 },
  { day: 'R', amount: 65 },
  { day: 'K', amount: 30 },
  { day: 'J', amount: 48 },
  { day: 'S', amount: 80 },
  { day: 'M', amount: 40 },
];

export default function Page() {
  const { user, login } = useTransaction();
  const [telegramId, setTelegramId] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!telegramId) return alert('Silakan masukkan ID Telegram!');
    login({ id: telegramId, first_name: name || 'Pengguna' });
  };

  const handleLogout = () => {
    window.location.reload();
  };

  // ==========================================
  // TAMPILAN 1: FORM LOGIN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
        <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center border border-gray-300">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Dashboard Keuangan</h1>
          <p className="mb-6 text-gray-500 text-xs">Masukkan ID Telegram kamu untuk mengakses catatan keuangan.</p>
          
          <form onSubmit={handleManualLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ID Telegram (Wajib)</label>
              <input
                type="number"
                placeholder="Contoh: 12345"
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-gray-600 text-sm"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Panggilan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Budi"
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:outline-none focus:border-gray-600 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gray-800 text-white font-semibold p-3 rounded-xl hover:bg-gray-900 transition-colors mt-2 text-sm"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">Belum pernah catat pengeluaran?</p>
            <a 
              href="https://t.me/softdevkeuanganbot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full bg-gray-100 text-gray-800 font-medium p-2.5 rounded-xl border border-gray-300 hover:bg-gray-200 transition-colors text-xs"
            >
              🤖 Mulai Chat Bot Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: UTAMA (WIREFRAME COMPLIANT)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-200 max-w-md mx-auto relative pb-24 shadow-xl overflow-hidden font-sans text-gray-800">
      
      {/* AREA KONTEN BERDASARKAN TAB */}
      <div className="bg-white min-h-screen pb-20">
        <AnimatePresence mode="wait">
          
          {/* ========================================== */}
          {/* TAB 1: HOME (Sesuai Gambar Wireframe 2)     */}
          {/* ========================================== */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              {/* Header Home */}
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold text-gray-900">Oktober 2026</h1>
                <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                  U
                </button>
              </div>

              {/* Card 1: Aman Jajan Hari Ini */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <p className="text-xs text-gray-600 font-medium">Aman jajan hari ini</p>
                <h2 className="text-3xl font-extrabold text-gray-900 my-1">Rp50.000</h2>
                <p className="text-[11px] text-gray-500">10 hari lagi sampai kiriman (5 Nov)</p>
              </div>

              {/* Grid Card 2 & 3: Pengeluaran & Sisa Saldo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-3.5">
                  <p className="text-[11px] text-gray-600 font-medium">Pengeluaran bulan ini</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">Rp995.000</p>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-3.5">
                  <p className="text-[11px] text-gray-600 font-medium">Sisa saldo</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">Rp505.000</p>
                </div>
              </div>

              {/* Card 4: Donut Chart Pengeluaran per Kategori */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Pengeluaran per kategori</h3>
                <div className="flex items-center justify-between">
                  {/* Recharts Donut */}
                  <div className="w-28 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataKategoriDonut}
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {dataKategoriDonut.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Rincian Kategori */}
                  <div className="space-y-1.5 text-xs flex-1 ml-4">
                    {dataKategoriDonut.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section: Transaksi Terakhir */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Transaksi terakhir</h3>
                  <button onClick={() => setActiveTab('riwayat')} className="text-xs text-gray-500 hover:text-gray-800">Lihat semua</button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Nasi goreng</p>
                        <p className="text-[10px] text-gray-500">Makan · via Telegram</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">Rp15.000</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Grab</p>
                        <p className="text-[10px] text-gray-500">Transport · via Telegram</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">Rp23.500</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Fotokopi modul</p>
                        <p className="text-[10px] text-gray-500">Kuliah · via Telegram</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">Rp12.000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 2: RIWAYAT (Sesuai Gambar Wireframe 3)  */}
          {/* ========================================== */}
          {activeTab === 'riwayat' && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              <h1 className="text-2xl font-bold text-gray-900">Riwayat</h1>

              {/* Selector Bulan */}
              <div className="flex justify-between items-center text-sm font-bold text-gray-800 px-8">
                <button className="text-gray-400">&lt;</button>
                <span>Oktober 2026</span>
                <button className="text-gray-400">&gt;</button>
              </div>

              {/* Filter Pills Kategori */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Makan', 'Transport', 'Kuliah'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-4 py-1.5 rounded-full border transition-colors ${
                      selectedFilter === cat
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-700 border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Group: Hari ini */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-gray-500">Hari ini</p>
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Nasi goreng</p>
                      <p className="text-[10px] text-gray-500">Makan · via Telegram</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rp15.000</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Fotokopi modul</p>
                      <p className="text-[10px] text-gray-500">Kuliah · via Telegram</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rp12.000</span>
                </div>
              </div>

              {/* Group: Kemarin (Dengan Tampilan Edit / Hapus Sesuai Wireframe) */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-gray-500">Kemarin</p>
                
                {/* Item Aktif Digeser/Di-klik */}
                <div className="border border-gray-400 bg-gray-50 p-2 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Grab</p>
                      <p className="text-[10px] text-gray-500">Transport</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 mr-1">Rp23.500</span>
                    <button className="bg-gray-600 text-white text-[11px] px-2.5 py-1 rounded-lg">Edit</button>
                    <button className="bg-gray-800 text-white text-[11px] px-2.5 py-1 rounded-lg">Hapus</button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Kopi</p>
                      <p className="text-[10px] text-gray-500">Makan · manual</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rp18.000</span>
                </div>
              </div>

              {/* Group: 23 Okt */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-gray-500">23 Okt</p>
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Bensin</p>
                      <p className="text-[10px] text-gray-500">Transport · via Telegram</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rp30.000</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Nonton</p>
                      <p className="text-[10px] text-gray-500">Hiburan · via Telegram</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rp45.000</span>
                </div>
              </div>

              {/* Tombol Tambah Manual */}
              <div className="pt-2">
                <button className="w-full border border-gray-400 text-gray-800 text-xs font-bold py-3 rounded-2xl bg-white hover:bg-gray-50">
                  + Tambah manual
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 3: BUDGET (Sesuai Gambar Wireframe 4)   */}
          {/* ========================================== */}
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Budget</h1>

              {/* Card Total Budget */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Total budget bulan ini</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Rp1.350.000</h2>
                
                {/* Progress Bar Utama */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden my-2">
                  <div className="bg-gray-700 h-2.5 rounded-full" style={{ width: '74%' }}></div>
                </div>
                <p className="text-[11px] text-gray-500">Terpakai Rp995.000 · 74%</p>
              </div>

              {/* Card Rincian Kategori Budget */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-4">
                
                {/* Makan */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>Makan</span>
                    <span className="text-gray-500 font-normal">Rp595.000 / Rp700.000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gray-700 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">85% · hampir habis</p>
                </div>

                {/* Transport */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>Transport</span>
                    <span className="text-gray-500 font-normal">Rp80.000 / Rp200.000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">40%</p>
                </div>

                {/* Kuliah */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>Kuliah</span>
                    <span className="text-gray-500 font-normal">Rp165.000 / Rp300.000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">55%</p>
                </div>

                {/* Hiburan */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>Hiburan</span>
                    <span className="text-gray-500 font-normal">Rp155.000 / Rp150.000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gray-900 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-[10px] text-gray-900 font-bold mt-1">Melebihi budget</p>
                </div>

              </div>

              {/* Tombol Atur Budget */}
              <button className="w-full border border-gray-400 text-gray-800 text-xs font-bold py-3 rounded-2xl bg-white hover:bg-gray-50">
                Atur budget
              </button>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 4: INSIGHT (Sesuai Gambar Wireframe 5)  */}
          {/* ========================================== */}
          {activeTab === 'insight' && (
            <motion.div
              key="insight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Insight</h1>

              {/* Card 1: Ringkasan Minggu Ini & Grafik Batang */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-3">
                <p className="text-xs text-gray-600 font-medium">Ringkasan minggu ini</p>
                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                  Kamu menghabiskan <strong className="text-gray-900">Rp245.000</strong> minggu ini. Makan jadi pengeluaran terbesar (60%).
                </p>

                {/* Recharts Bar Chart Mingguan */}
                <div className="h-32 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataMingguanInsight}>
                      <Bar dataKey="amount" fill="#6B7280" radius={[4, 4, 0, 0]} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4B5563' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: Prediksi Sampai Kiriman */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-gray-600 font-medium">Prediksi sampai kiriman</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Uang cukup</h2>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Dengan pola sekarang, perkiraan sisa Rp100.000 saat kiriman berikutnya tiba (5 Nov).
                </p>
              </div>

              {/* Card 3: Perlu Perhatian */}
              <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-gray-600 font-medium">Perlu perhatian</p>
                <p className="text-xs font-bold text-gray-900 pt-0.5">
                  Hiburan melebihi budget Rp5.000.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================== */}
      {/* BOTTOM NAVIGATION (Wireframe Exact Match)  */}
      {/* ========================================== */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-300 grid grid-cols-4 py-2 px-1 text-center shadow-lg z-20">
        
        {/* Home Button */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'home' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="w-5 h-4 border-2 border-current rounded-sm mb-1"></div>
          <span className="text-[10px]">Home</span>
        </button>

        {/* Riwayat Button */}
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'riwayat' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="w-5 h-4 border-2 border-current rounded-sm mb-1"></div>
          <span className="text-[10px]">Riwayat</span>
        </button>

        {/* Budget Button */}
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'budget' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="w-5 h-4 border-2 border-current rounded-sm mb-1"></div>
          <span className="text-[10px]">Budget</span>
        </button>

        {/* Insight Button */}
        <button
          onClick={() => setActiveTab('insight')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'insight' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="w-5 h-4 border-2 border-current rounded-sm mb-1"></div>
          <span className="text-[10px]">Insight</span>
        </button>

      </nav>

    </div>
  );
}