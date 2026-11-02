'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TransactionCard from '../TransactionCard';

export default function RiwayatTab({ transactions = [], onResetData, onDeleteTransaction }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Makanan & Minuman', 'Transportasi', 'Kuliah', 'Hiburan', 'Umum'];

  // Filter transaksi berdasarkan kategori chip yang dipilih
  const filteredTransactions = transactions.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    const cat = item.category || '';
    if (selectedCategory === 'Makanan & Minuman') {
      return cat.includes('Makanan') || cat.includes('Minuman') || cat.includes('Kopi');
    }
    return cat.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Fungsi penentuan label grup tanggal (Hari ini / Kemarin / Tanggal Spesifik)
  const getGroupLabel = (dateString) => {
    if (!dateString) return 'Lainnya';
    const txDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = txDate.toDateString() === today.toDateString();
    const isYesterday = txDate.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hari ini';
    if (isYesterday) return 'Kemarin';

    // Mengubah "Sebelumnya" menjadi tanggal spesifik Bahasa Indonesia (Contoh: 31 Oktober 2026)
    return txDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Mengelompokkan data transaksi berdasarkan label grup
  const groupedTransactions = filteredTransactions.reduce((acc, item) => {
    const label = getGroupLabel(item.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedTransactions);

  return (
    <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Header & Reset Data */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <button
          onClick={onResetData}
          className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1"
        >
          🗑️ Reset Data
        </button>
      </div>

      {/* Filter Kategori Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-neutral-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Daftar Transaksi terkelompok berdasarkan Tanggal */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm">
          Tidak ada transaksi ditemukan.
        </div>
      ) : (
        <div className="space-y-6">
          {groupKeys.map((groupLabel) => (
            <div key={groupLabel} className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupLabel}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedTransactions[groupLabel].map((item) => (
                  <TransactionCard key={item.id} transaction={item} onDelete={onDeleteTransaction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}