'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function InsightTab({ totalPengeluaran, sisaSaldo, amanJajanHariIni }) {
  // Simulasi data mingguan berdasarkan total
  const weeklyData = [
    { day: 'Sen', amount: totalPengeluaran * 0.15 },
    { day: 'Sel', amount: totalPengeluaran * 0.1 },
    { day: 'Rab', amount: totalPengeluaran * 0.25 },
    { day: 'Kam', amount: totalPengeluaran * 0.1 },
    { day: 'Jum', amount: totalPengeluaran * 0.2 },
    { day: 'Sab', amount: totalPengeluaran * 0.15 },
    { day: 'Min', amount: totalPengeluaran * 0.05 },
  ];

  return (
    <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Insight</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-3">
          <p className="text-xs text-gray-600 font-medium">Ringkasan mingguan</p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold my-2 text-gray-900 truncate" title={`Rp${totalPengeluaran.toLocaleString('id-ID')}`}>
            Rp{totalPengeluaran.toLocaleString('id-ID')}
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
          <h2 className={`text-2xl md:text-3xl font-extrabold ${sisaSaldo < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {sisaSaldo > 0 ? 'Uang Cukup Aman' : 'Uang Kritis / Defisit!'}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
            Sisa saldo kamu adalah <strong className="truncate inline-block max-w-[150px] align-bottom" title={`Rp${sisaSaldo.toLocaleString('id-ID')}`}>Rp{sisaSaldo.toLocaleString('id-ID')}</strong>. Batas aman jajan harianmu hingga akhir bulan adalah <strong>Rp{amanJajanHariIni.toLocaleString('id-ID')}/hari</strong>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}