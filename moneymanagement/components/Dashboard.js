'use client';
import { Wallet, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatRupiah } from '@/lib/utils';
// Pastikan nama hook-nya sesuai dengan yang kamu ekspor di TransactionContext.js
import { useTransaction } from '../app/context/TransactionContext'; 

export default function Dashboard() {
  // Kita ambil transactions dan totalExpense (asumsi penamaan di Context sudah diubah)
  const { transactions, totalExpense } = useTransaction();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Ringkasan Keuangan
          {transactions.length > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 bg-red-500 hover:bg-red-600">
              {transactions.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Riwayat Pengeluaran
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-10">Belum ada pengeluaran yang dicatat.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((item, index) => (
                <div className="flex items-center justify-between border-b pb-3" key={item.id || index}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    {/* Menampilkan kategori jika ada dari AI Telegram nanti */}
                    <span className="text-xs text-muted-foreground capitalize">{item.category || 'Umum'}</span>
                  </div>
                  <div className="text-sm font-semibold text-red-500">
                    - {formatRupiah(item.price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t pt-4 pb-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total Pengeluaran Bulan Ini</span>
            <span className="text-2xl font-bold text-red-600">{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}