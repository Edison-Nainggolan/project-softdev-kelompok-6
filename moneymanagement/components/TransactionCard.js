'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/utils';

export default function TransactionCard({ transaction }) {
  return (
    <Card className="overflow-hidden hover:bg-slate-50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        {/* Bagian Kiri: Nama dan Kategori */}
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-snug text-slate-800">
            {transaction.title}
          </p>
          <Badge variant="outline" className="w-fit text-xs bg-slate-100 text-slate-600 border-slate-200">
            {transaction.category || 'Umum'}
          </Badge>
        </div>
        
        {/* Bagian Kanan: Nominal Pengeluaran */}
        <div className="text-right">
          <p className="text-base font-bold text-red-500">
            - {formatRupiah(transaction.price)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}