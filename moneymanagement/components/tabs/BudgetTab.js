'use client';

import { motion } from 'framer-motion';

export default function BudgetTab({ totalPengeluaran, saldoAwal, kategoriStats }) {
  // Sistem Algoritma Budgeting Dinamis (Persentase dari Saldo Awal)
  const budgetBatas = {
    'Makanan & Minuman': saldoAwal * 0.40, // 40%
    'Transportasi': saldoAwal * 0.15,      // 15%
    'Kuliah': saldoAwal * 0.15,            // 15%
    'Tagihan': saldoAwal * 0.10,           // 10%
    'Belanja': saldoAwal * 0.10,           // 10%
    'Hiburan': saldoAwal * 0.05,           // 5%
    'Umum': saldoAwal * 0.05,              // 5%
  };

  const categories = Object.keys(budgetBatas);

  return (
    <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Kartu Ringkasan Terpakai */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs text-gray-500 font-medium mb-1">Total Terpakai Bulan Ini</p>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 truncate" title={`Rp${totalPengeluaran.toLocaleString('id-ID')}`}>
          Rp{totalPengeluaran.toLocaleString('id-ID')}
        </h2>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${totalPengeluaran > saldoAwal ? 'bg-red-500' : 'bg-neutral-800'}`} 
            style={{ width: `${Math.min(100, (totalPengeluaran / (saldoAwal || 1)) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Daftar Kategori Dinamis */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-6">
          {categories.map((cat) => {
            const terpakai = kategoriStats[cat] || 0;
            const batas = budgetBatas[cat];
            
            // Hindari NaN jika batas 0 (misal saldo awal belum diisi)
            const percentVal = batas > 0 ? (terpakai / batas) * 100 : 0;
            const percent = Math.min(100, Math.round(percentVal));
            
            // Logika Warna Warning: Merah jika melebihi batas budget kategori
            const isOverBudget = terpakai > batas;
            
            return (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-800">{cat}</span>
                  <span className={`text-xs ${isOverBudget ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    Rp{terpakai.toLocaleString('id-ID')} / Rp{batas.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-neutral-800'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}