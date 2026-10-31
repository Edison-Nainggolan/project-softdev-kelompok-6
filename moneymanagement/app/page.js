'use client';

import { useState, useEffect } from 'react';
import { useTransaction } from './context/TransactionContext';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getStandardCategory } from '../lib/utils';

// Import Komponen Navigasi & Form
import BottomNav from '../components/BottomNav';
import LoginForm from '../components/LoginForm';
import EditSaldoModal from '../components/EditSaldoModal';

// Import Tab Konten
import HomeTab from '../components/tabs/HomeTab';
import RiwayatTab from '../components/tabs/RiwayatTab';
import BudgetTab from '../components/tabs/BudgetTab';
import InsightTab from '../components/tabs/InsightTab';

export default function Page() {
  const { user, login, logout } = useTransaction();
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saldoAwal, setSaldoAwal] = useState(1500000);
  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [inputSaldo, setInputSaldo] = useState('');

  const [savingGoals] = useState([
    { id: 1, title: 'Dana Darurat Kos', target: 500000, current: 350000 },
    { id: 2, title: 'Beli Buku & Modul', target: 200000, current: 120000 },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const savedSaldo = localStorage.getItem(`saldo_awal_${user.id}`);
    if (savedSaldo) setSaldoAwal(Number(savedSaldo));

    async function fetchTransactions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('telegram_id', String(user.id))
        .order('created_at', { ascending: false });

      if (!error) setTransactions(data || []);
      setLoading(false);
    }

    fetchTransactions();
  }, [user]);

  const handleSaveSaldo = (e) => {
    e.preventDefault();
    const nominal = Number(inputSaldo);
    if (isNaN(nominal) || nominal < 0) return alert('Masukkan nominal yang valid!');
    
    setSaldoAwal(nominal);
    localStorage.setItem(`saldo_awal_${user.id}`, nominal);
    setIsEditingSaldo(false);
    setInputSaldo('');
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetData = async () => {
    if (!confirm('⚠️ Reset semua data transaksi secara permanen?')) return;
    const { error } = await supabase.from('transactions').delete().eq('telegram_id', String(user.id));
    if (!error) {
      setTransactions([]);
      alert('Data berhasil di-reset!');
    }
  };

  // Jika user belum login, tampilkan LoginForm
  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  // Kalkulasi data dashboard
  const now = new Date();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sisaHari = Math.max(1, totalDaysInMonth - now.getDate() + 1);

  const totalPengeluaran = transactions.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const sisaSaldo = saldoAwal - totalPengeluaran;
  const amanJajanHariIni = sisaSaldo > 0 ? Math.floor(sisaSaldo / sisaHari) : 0;

  const kategoriStats = transactions.reduce((acc, item) => {
    const cat = getStandardCategory(item.category);
    acc[cat] = (acc[cat] || 0) + (Number(item.price) || 0);
    return acc;
  }, {});

  const dataChart = Object.keys(kategoriStats).map((catKey) => ({
    name: catKey,
    value: kategoriStats[catKey],
    display: `Rp${kategoriStats[catKey].toLocaleString('id-ID')}`,
  }));

  return (
    <div className="min-h-screen bg-gray-100 w-full max-w-[1400px] mx-auto relative pb-28 shadow-xl font-sans text-gray-900">
      <div className="bg-white min-h-screen p-4 sm:p-8 lg:p-12 pb-24">
        
        {/* Header User */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FinTraces Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <h2 className="text-xs text-gray-500">Selamat Datang,</h2>
              <p className="text-base md:text-xl font-bold text-gray-800">{user.first_name} ({user.id})</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg border border-red-200 transition-colors">
            Keluar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeTab
              amanJajanHariIni={amanJajanHariIni}
              sisaHari={sisaHari}
              totalPengeluaran={totalPengeluaran}
              transactions={transactions}
              sisaSaldo={sisaSaldo}
              saldoAwal={saldoAwal}
              dataChart={dataChart}
              loading={loading}
              savingGoals={savingGoals}
              onOpenEditSaldo={() => { setInputSaldo(saldoAwal); setIsEditingSaldo(true); }}
              onNavigateTab={setActiveTab}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'riwayat' && (
            <RiwayatTab
              transactions={transactions}
              onResetData={handleResetData}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab
              totalPengeluaran={totalPengeluaran}
              saldoAwal={saldoAwal}
              kategoriStats={kategoriStats}
            />
          )}

          {activeTab === 'insight' && (
            <InsightTab
              totalPengeluaran={totalPengeluaran}
              sisaSaldo={sisaSaldo}
              amanJajanHariIni={amanJajanHariIni}
            />
          )}
        </AnimatePresence>

        {isEditingSaldo && (
          <EditSaldoModal
            inputSaldo={inputSaldo}
            setInputSaldo={setInputSaldo}
            onSave={handleSaveSaldo}
            onClose={() => setIsEditingSaldo(false)}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}