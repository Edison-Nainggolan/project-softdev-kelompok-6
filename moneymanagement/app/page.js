"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Data dummy sementara untuk Recharts (Nanti kita ganti dengan data dari Supabase)
const dataKategori = [
  { name: 'Makan', value: 595000, color: '#3B82F6' },     // Biru Utama (Brand)
  { name: 'Transport', value: 80000, color: '#93C5FD' },  // Biru Secondary
  { name: 'Kuliah', value: 165000, color: '#1E3A8A' },    // Biru Hover (Gelap)
  { name: 'Hiburan', value: 155000, color: '#DBEAFE' },   // Biru Tertiary
];

export default function DashboardPage() {
  // State untuk melacak tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState('home');

  // ==========================================
  // KOMPONEN TAB: HOME (Menampilkan Insight & Grafik)
  // ==========================================
  const TabHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="p-5 space-y-6"
    >
      {/* Kartu Saldo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm mb-1">Sisa saldo bulan ini</p>
        <h2 className="text-3xl font-bold text-gray-900">Rp505.000</h2>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <p className="text-gray-400">Pengeluaran</p>
            <p className="font-semibold text-red-500">Rp995.000</p>
          </div>
        </div>
      </div>

      {/* Grafik Recharts: Donut Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Pengeluaran per kategori</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataKategori}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {dataKategori.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp${value.toLocaleString('id-ID')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Keterangan Warna Grafik */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {dataKategori.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ==========================================
  // KOMPONEN TAB: RIWAYAT (Halaman Kosong Sementara)
  // ==========================================
  const TabRiwayat = () => (
    <motion.div
      key="riwayat"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-5"
    >
      <h2 className="text-2xl font-bold mb-4">Riwayat Transaksi</h2>
      <p className="text-gray-500">Daftar transaksi dari Supabase akan muncul di sini.</p>
    </motion.div>
  );

  // ==========================================
  // RENDER UTAMA APLIKASI
  // ==========================================
  return (
    // max-w-md mx-auto membuat tampilannya seperti layar HP meski dibuka di Laptop
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative pb-20 shadow-2xl overflow-hidden">
      
      {/* Header Aplikasi */}
      <header className="bg-white px-5 py-4 border-b sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-bold text-xl text-blue-600">FinTraces</h1>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
          UKM
        </div>
      </header>

      {/* Area Konten Dinamis yang Berganti-ganti (Diatur oleh Framer Motion) */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <TabHome />}
        {activeTab === 'riwayat' && <TabRiwayat />}
        {/* Nanti kita bisa tambah activeTab === 'budget' dan 'insight' di sini */}
      </AnimatePresence>

      {/* ========================================== */}
      {/* BOTTOM NAVIGATION (Menu Bawah) */}
      {/* ========================================== */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-3 px-2 pb-5">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {/* Ikon Home Sederhana */}
          <div className={`text-xl ${activeTab === 'home' ? 'scale-110 transition-transform' : ''}`}>🏠</div>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('riwayat')} 
          className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'riwayat' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`text-xl ${activeTab === 'riwayat' ? 'scale-110 transition-transform' : ''}`}>📄</div>
          <span className="text-[10px] font-medium">Riwayat</span>
        </button>

        <button 
          onClick={() => setActiveTab('budget')} 
          className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'budget' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`text-xl ${activeTab === 'budget' ? 'scale-110 transition-transform' : ''}`}>💰</div>
          <span className="text-[10px] font-medium">Budget</span>
        </button>

        <button 
          onClick={() => setActiveTab('insight')} 
          className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'insight' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`text-xl ${activeTab === 'insight' ? 'scale-110 transition-transform' : ''}`}>📈</div>
          <span className="text-[10px] font-medium">Insight</span>
        </button>
      </nav>
      
    </div>
  );
}