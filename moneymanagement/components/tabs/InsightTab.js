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

  const txList = Array.isArray(transactions) 
    ? transactions 
    : (transactions?.data || transactions?.transactions || []);

  const now = new Date();
  
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  txList.forEach((item) => {
    if (!item) return;

    const amount = Number(
      item.price || item.amount || item.nominal || item.total || item.harga || 0
    );

    if (amount <= 0) return;

    const dateStr = item.created_at || item.date || item.tanggal;
    
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        if (parsedDate >= startOfWeek) {
          const dayKey = dayIndexToKey[parsedDate.getDay()];
          if (weeklyTotals[dayKey] !== undefined) {
            weeklyTotals[dayKey] += amount;
          }
        }
      }
    }
    
    totalWeeklyExpenses += amount;
  });

  const maxExpense = Math.max(...Object.values(weeklyTotals), 1);
  const sisaSaldo = Math.max(0, Number(saldoAwal || 0) - totalWeeklyExpenses);
  
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sisaHari = Math.max(1, totalDaysInMonth - now.getDate() + 1);
  const amanJajanHarian = Math.max(0, Math.floor(sisaSaldo / sisaHari));

  const totalMingguIni = Object.values(weeklyTotals).reduce((a, b) => a + b, 0);

  return (
    <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      
      {/* Ringkasan Grafik Mingguan Clean Light Theme */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <p className="text-xs text-gray-500 font-medium">Ringkasan minggu ini</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
            Rp{totalMingguIni.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Container Bar Chart Terang */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 pt-10 pb-4">
          <div className="flex items-end justify-between h-36 gap-2 sm:gap-3 px-1">
            {daysList.map((d) => {
              const val = weeklyTotals[d.key];
              const heightPercent = val > 0 ? Math.max(15, Math.round((val / maxExpense) * 100)) : 0;

              return (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                  {/* Tooltip Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    {d.key}: Rp{val.toLocaleString('id-ID')}
                  </div>

                  {/* Track Bar Abu Terang & Batang Biru */}
                  <div className="w-full bg-slate-200/70 rounded-t-lg h-28 flex items-end overflow-hidden relative">
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>

                  {/* Label Hari */}
                  <span className="text-xs font-semibold text-slate-600">{d.label}</span>
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