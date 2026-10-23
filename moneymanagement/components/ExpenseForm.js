'use client';
import { useState } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import TransactionCard from './TransactionCard';
import Dashboard from './Dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTransaction } from '../app/context/TransactionContext';

export default function ExpenseForm() {
  // Mengambil state dan fungsi penambah data dari Context
  const { transactions, addTransaction } = useTransaction();
  
  const [query, setQuery] = useState('');
  
  // State untuk menangkap input form manual
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  // ===== FITUR SEARCH =====
  // Logika pencariannya tetap sama, tapi sekarang mencari nama pengeluaran
  const filtered = transactions.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  // ===== FUNGSI SIMPAN DATA MANUAL =====
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) return; // Cegah input kosong
    
    // Format data baru untuk dimasukkan ke state
    const newExpense = {
      id: Date.now(),
      title: title,
      price: parseInt(price),
      category: 'Manual',
    };

    addTransaction(newExpense);
    
    // Kosongkan form setelah berhasil disimpan
    setTitle('');
    setPrice('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">CatatUang.</h1>
          <Dashboard />
        </div>
      </header>
      
      <main className="container max-w-3xl py-8 space-y-8">
        
        {/* BAGIAN 1: FORM INPUT MANUAL */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Catat Pengeluaran Baru</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Nama Pengeluaran</label>
              <Input 
                placeholder="Contoh: Makan siang geprek" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Nominal (Rp)</label>
              <Input 
                type="number" 
                placeholder="15000" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </form>
        </section>

        {/* BAGIAN 2: RIWAYAT & SEARCH */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari riwayat pengeluaran..."
                className="pl-8 bg-white border-slate-300"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* TAMPILAN LIST TRANSAKSI */}
          <div className="flex flex-col gap-3">
            {transactions.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground bg-white rounded-lg border border-dashed">
                Belum ada pengeluaran. Coba catat transaksi pertamamu!
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground bg-white rounded-lg border border-dashed">
                Pengeluaran tidak ditemukan.
              </p>
            ) : (
              // Looping data transaksi memanggil komponen TransactionCard
              filtered.map(t => <TransactionCard key={t.id} transaction={t} />)
            )}
          </div>
        </section>

      </main>
    </div>
  );
}