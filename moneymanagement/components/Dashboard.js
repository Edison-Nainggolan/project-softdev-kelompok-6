'use client';

import { useState } from 'react';
import { Wallet, Receipt, X } from 'lucide-react';
import { useTransaction } from '../app/context/TransactionContext';

export default function Dashboard() {
  const { transactions, totalExpense } = useTransaction();
  const [isOpen, setIsOpen] = useState(false);

  // Format angka ke mata uang Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  return (
    <>
      {/* Tombol Pemicu Ringkasan Keuangan */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
      >
        <Wallet className="h-4 w-4" />
        <span>Ringkasan Keuangan</span>
        {transactions.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white font-bold">
            {transactions.length}
          </span>
        )}
      </button>

      {/* Drawer / Modal Samping */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span>Riwayat Pengeluaran</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List Transaksi */}
            <div className="flex-1 overflow-y-auto py-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-10">
                  Belum ada pengeluaran yang dicatat.
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((item, index) => (
                    <div
                      className="flex items-center justify-between border-b border-gray-100 pb-3"
                      key={item.id || index}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {item.category || 'Umum'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-red-500">
                        - {formatRupiah(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Total Pengeluaran */}
            <div className="border-t pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Total Pengeluaran Bulan Ini
                </span>
                <span className="text-2xl font-extrabold text-red-600">
                  {formatRupiah(totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}