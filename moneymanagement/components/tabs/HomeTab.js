'use client';

import { motion } from 'framer-motion';
import DonutChart from '../DonutChart';

export default function HomeTab({ 
  amanJajanHariIni, sisaHari, totalPengeluaran, transactions, 
  sisaSaldo, saldoAwal, dataChart, loading, savingGoals, 
  onOpenEditSaldo, onNavigateTab, onDeleteTransaction 
}) {
  return (
    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Oktober 2026</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
          <p className="text-xs text-gray-500 font-medium">Aman jajan hari ini</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold my-2 text-gray-900 truncate" title={`Rp${amanJajanHariIni.toLocaleString('id-ID')}`}>
            Rp{amanJajanHariIni.toLocaleString('id-ID')}
          </h2>
          <p className="text-xs text-gray-400">{sisaHari} hari lagi dalam bulan ini</p>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
          <p className="text-xs text-gray-500 font-medium">Pengeluaran bulan ini</p>
          <p className="text-3xl lg:text-4xl font-extrabold my-2 text-gray-900 truncate" title={`Rp${totalPengeluaran.toLocaleString('id-ID')}`}>
            Rp{totalPengeluaran.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400">{transactions.length} transaksi tercatat</p>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 relative">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">Sisa saldo</p>
            <button onClick={onOpenEditSaldo} className="text-xs text-blue-600 font-semibold hover:underline">Atur Saldo</button>
          </div>
          <p className={`text-3xl lg:text-4xl font-extrabold my-2 truncate ${sisaSaldo < 0 ? 'text-red-600' : 'text-gray-900'}`} title={`Rp${sisaSaldo.toLocaleString('id-ID')}`}>
            Rp{sisaSaldo.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400">Total awal: Rp{saldoAwal.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4">Pengeluaran per kategori</h3>
          <DonutChart customData={dataChart} />
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold">Transaksi terakhir</h3>
            <button onClick={() => onNavigateTab('riwayat')} className="text-xs text-blue-600 font-semibold hover:underline">Lihat semua</button>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400">Memuat data...</p>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">Belum ada data transaksi bulan ini.</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.category} · Telegram</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs md:text-sm font-bold text-gray-900 max-w-[120px] truncate">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                    <button onClick={() => onDeleteTransaction(item.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">🎯 Target Tabungan Bulan Ini</h3>
            <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md border border-blue-200">Impian</span>
          </div>
          <div className="space-y-3">
            {savingGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-800">
                    <span>{goal.title}</span>
                    <span className="text-gray-500 font-normal">Rp{goal.current.toLocaleString('id-ID')} / Rp{goal.target.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-neutral-800 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">⚡ Perintah Cepat Bot Telegram</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ketik perintah di bawah ini langsung di chat <strong className="text-gray-800">@softdevkeuanganbot</strong>:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-700">/saldo - Cek Sisa</div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-700">/riwayat - 5 Transaksi</div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-700">/budget - Status Kategori</div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-700">/insight - Tips AI</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-3 md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-900">💡 Rekomendasi FinTraces AI</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {sisaSaldo > 500000 
              ? 'Keuangan kamu bulan ini dalam kategori aman! Pertahankan batas aman jajan harian agar tidak ada pembengkakan di akhir bulan.'
              : sisaSaldo >= 0 
              ? 'Perhatian! Sisa saldo kamu sudah menipis. Utamakan pengeluaran untuk kebutuhan kuliah dan makan harian saja.'
              : '⚠️ PERINGATAN DEFISIT! Uang sakumu telah habis/terlampaui. Hentikan pengeluaran yang tidak penting!'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}