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

  const dayIndexToKey = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const weeklyTotals = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 };
  let totalWeeklyExpenses = 0;

  // Memastikan data berupa Array (menangani jika data terbungkus dalam object)
  const txList = Array.isArray(transactions) 
    ? transactions 
    : (transactions?.data || transactions?.transactions || []);

  const todayKey = dayIndexToKey[new Date().getDay()];

  txList.forEach((item) => {
    if (!item) return;

    // Otomatis mengekstrak nominal dari berbagai variasi nama kolom
    const amount = Number(
      item.amount ?? item.nominal ?? item.total ?? item.harga ?? item.biaya ?? 0
    );

    if (amount <= 0) return;

    // Otomatis mengekstrak tanggal
    const dateStr = item.created_at || item.date || item.tanggal;
    let dayKey = todayKey;

    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        dayKey = dayIndexToKey[parsedDate.getDay()];
      }
    }

    if (weeklyTotals[dayKey] !== undefined) {
      weeklyTotals[dayKey] += amount;
    }
    totalWeeklyExpenses += amount;
  });

  const maxExpense = Math.max(...Object.values(weeklyTotals), 1);
  const sisaSaldo = Math.max(0, Number(saldoAwal || 0) - totalWeeklyExpenses);
  const amanJajanHarian = Math.round(sisaSaldo / 30);

  return (
    <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Ringkasan Grafik Mingguan */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Ringkasan mingguan</p>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Rp{totalWeeklyExpenses.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Container Bar Chart */}
        <div className="bg-neutral-900 rounded-2xl p-4 pt-8 pb-3">
          <div className="flex items-end justify-between h-36 gap-2 px-2">
            {daysList.map((d) => {
              const val = weeklyTotals[d.key];
              const heightPercent = val > 0 ? Math.max(15, Math.round((val / maxExpense) * 100)) : 0;

              return (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                  {/* Tooltip Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-white border border-gray-200 text-gray-900 text-[10px] font-bold py-1 px-2 rounded-md shadow-md whitespace-nowrap z-10 pointer-events-none">
                    {d.key}: Rp{val.toLocaleString('id-ID')}
                  </div>

                  {/* Tiang Abu-abu & Batang Biru Aktif */}
                  <div className="w-full bg-neutral-800/80 rounded-t-md h-24 flex items-end overflow-hidden relative">
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
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

      {/* Card Prediksi Sisa Saldo */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
        <p className="text-xs text-gray-500 font-medium">Prediksi Sisa Saldo</p>
        <h3 className="text-lg font-bold text-gray-900">
          {sisaSaldo > 100000 ? 'Uang Cukup Aman' : 'Perhatian: Saldo Menipis'}
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Sisa saldo kamu adalah <span className="font-bold">Rp{sisaSaldo.toLocaleString('id-ID')}</span>. Batas aman jajan harianmu hingga akhir bulan adalah <span className="font-bold">Rp{amanJajanHarian.toLocaleString('id-ID')}/hari</span>.
        </p>
      </div>

    </motion.div>
  );
}