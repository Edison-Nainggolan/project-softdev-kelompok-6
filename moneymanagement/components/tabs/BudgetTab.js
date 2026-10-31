'use client';

import { motion } from 'framer-motion';
import { BUDGET_LIMITS } from '../../lib/utils';

export default function BudgetTab({ totalPengeluaran, saldoAwal, kategoriStats }) {
  return (
    <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget</h1>

      <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-2">
        <p className="text-xs text-gray-600 font-medium">Total Terpakai Bulan Ini</p>
        <h2 className="text-3xl font-extrabold text-gray-900 truncate" title={`Rp${totalPengeluaran.toLocaleString('id-ID')}`}>
          Rp{totalPengeluaran.toLocaleString('id-ID')}
        </h2>
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
              <div className="flex justify-between text-xs md:text-sm font-bold text-gray-900 mb-2 gap-2">
                <span className="truncate">{catName}</span>
                <span className="text-gray-500 font-normal shrink-0">Rp{spent.toLocaleString('id-ID')} / Rp{limit.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full ${percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-amber-500' : 'bg-gray-800'}`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}