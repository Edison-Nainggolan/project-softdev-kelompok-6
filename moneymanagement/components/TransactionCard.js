'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TransactionCard({ transaction, onDelete }) {
  return (
    <Card className="overflow-hidden hover:bg-slate-50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        {/* Bagian Kiri: Judul dan Kategori */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-slate-800 truncate">
            {transaction.title}
          </p>
          <Badge variant="outline" className="w-fit text-[10px] bg-slate-100 text-slate-600 border-slate-200">
            {transaction.category || 'Umum'}
          </Badge>
        </div>
        
        {/* Bagian Kanan: Nominal & Tombol Hapus */}
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-sm font-bold text-red-500 max-w-[120px] sm:max-w-[180px] truncate" title={`Rp${Number(transaction.price || 0).toLocaleString('id-ID')}`}>
            - Rp{Number(transaction.price || 0).toLocaleString('id-ID')}
          </p>
          {onDelete && (
            <button 
              onClick={() => onDelete(transaction.id)}
              className="text-gray-400 hover:text-red-500 text-xs p-1 transition-colors"
              title="Hapus transaksi"
            >
              🗑️
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}