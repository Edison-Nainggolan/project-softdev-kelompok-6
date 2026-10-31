'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getStandardCategory } from '../../lib/utils';
import TransactionCard from '../TransactionCard';

export default function RiwayatTab({ transactions, onResetData, onDeleteTransaction }) {
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const filteredTransactions = selectedFilter === 'Semua'
    ? transactions
    : transactions.filter((item) => getStandardCategory(item.category) === getStandardCategory(selectedFilter));

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const hariIniList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === todayStr);
  const kemarinList = filteredTransactions.filter(item => new Date(item.created_at).toDateString() === yesterdayStr);
  const sebelumnyaList = filteredTransactions.filter(item => {
    const d = new Date(item.created_at).toDateString();
    return d !== todayStr && d !== yesterdayStr;
  });

  return (
    <motion.div key="riwayat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        {transactions.length > 0 && (
          <button onClick={onResetData} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200">
            🗑️ Reset Data
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {['Semua', 'Makanan & Minuman', 'Transportasi', 'Kuliah', 'Hiburan', 'Umum'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
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
                <TransactionCard key={item.id} transaction={item} onDelete={onDeleteTransaction} />
              ))}
            </div>
          </div>
        )}

        {kemarinList.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3">Kemarin</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kemarinList.map(item => (
                <TransactionCard key={item.id} transaction={item} onDelete={onDeleteTransaction} />
              ))}
            </div>
          </div>
        )}

        {sebelumnyaList.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3">Sebelumnya</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sebelumnyaList.map(item => (
                <TransactionCard key={item.id} transaction={item} onDelete={onDeleteTransaction} />
              ))}
            </div>
          </div>
        )}

        {filteredTransactions.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">Tidak ada riwayat transaksi.</p>
        )}
      </div>
    </motion.div>
  );
}