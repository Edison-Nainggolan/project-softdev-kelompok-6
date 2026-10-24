'use client';
import { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (telegramId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', String(telegramId))
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    } else {
      console.error('Gagal mengambil data transaksi:', error);
    }
    setLoading(false);
  };


  const deleteTransaction = async (transactionId) => {
    if (!user?.id) return;
    
    // Hapus dari Supabase
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('telegram_id', String(user.id));

    if (error) {
      console.error('Gagal menghapus transaksi:', error);
      alert('Gagal menghapus data. Coba lagi.');
    } else {
      setTransactions((prev) => prev.filter((item) => item.id !== transactionId));
    }
  };

  // Fungsi untuk mereset/menghapus SEMUA transaksi milik user yang login
  const resetAllTransactions = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('telegram_id', String(user.id));

    if (error) {
      console.error('Gagal mereset transaksi:', error);
      alert('Gagal mereset data. Coba lagi.');
    } else {
      setTransactions([]);
    }
  };

  // Fungsi saat user berhasil login via Telegram
  const login = (telegramUser) => {
    setUser(telegramUser);
    if (telegramUser?.id) {
      fetchTransactions(telegramUser.id);
    }
  };

  // Fungsi logout
  const logout = () => {
    setUser(null);
    setTransactions([]);
  };

  // Menghitung total pengeluaran otomatis
  const totalExpense = transactions.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <TransactionContext.Provider
      value={{
        user,
        transactions,
        loading,
        totalExpense,
        login,
        logout,
        fetchTransactions,
        deleteTransaction,     
        resetAllTransactions 
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransaction harus dipakai di dalam TransactionProvider');
  return ctx;
}