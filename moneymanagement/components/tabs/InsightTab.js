'use client';

import { motion } from 'framer-motion';

export default function InsightTab({ transactions = [], saldoAwal = 0 }) {
  const daysList = [
    { key: 'Sen', label: 'Sen' },
    { key: 'Sel', label: 'Sel' },
    { key: 'Rab', label: 'Rab' },
    { key: 'Kam', label: 'Kam' },
    { key: 'Jum', label: 'Jum' },
    { key: 'Sab', label: 'Sab' },
    { key: 'Min', label: 'Min' },
  ];

  // Map indeks JS getDay() [0=Min, 1=Sen, 2=Sel, 3=Rab, 4=Kam, 5=Jum, 6=Sab] ke kunci hari
  const dayIndexToKey = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Hitung total transaksi riil per hari untuk minggu berjalan
  const weeklyTotals = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 };
  
  let totalWeeklyExpenses = 0;

  transactions.forEach((item) => {
    if (!item.created_at) return;
    const date = new Date(item.created_at);
    const dayKey = dayIndexToKey[date.getDay()];
    const amount = Number(item.amount || item.nominal || 0);

    weeklyTotals[dayKey] += amount;
    totalWeeklyExpenses += amount;
  });

  // Cari nilai tertinggi untuk persentase tinggi batang grafik
  const maxExpense = Math.max(...Object.values(weeklyTotals), 1);

  return (
    <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Ringkasan Grafik Mingguan Dinamis */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Ringkasan mingguan</p>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Rp{totalWeeklyExpenses.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Bar Chart Real-Time */}
        <div className="bg-neutral-900 rounded-2xl p-4 pt-8 pb-3">
          <div className="flex items-end justify-between h-32 gap-2 px-2">
            {daysList.map((d) => {
              const val = weeklyTotals[d.key];
              const heightPercent = Math.min(100, Math.round((val / maxExpense) * 100));

              return (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-white border border-gray-200 text-gray-900 text-[10px] font-bold py-1 px-2 rounded-md shadow-md whitespace-nowrap z-10 pointer-events-none">
                    {d.key}: Rp{val.toLocaleString('id-ID')}
                  </div>

                  {/* Batang Grafik */}
                  <div className="w-full bg-neutral-800 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${val > 0 ? Math.max(15, heightPercent) : 0}%` }}
                    ></div>
                  </div>

                  {/* Label Hari */}
                  <span className="text-[11px] font-medium text-gray-400">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </motion.div>
  );
}