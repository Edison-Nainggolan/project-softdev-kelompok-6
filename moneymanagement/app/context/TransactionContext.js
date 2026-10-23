'use client';
import { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengambil data transaksi khusus Telegram ID user yang login
  const fetchTransactions = async (telegramId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', telegramId) // FILTER MULTI-USER BERDASARKAN ID TELEGRAM
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    } else {
      console.error('Gagal mengambil data transaksi:', error);
    }
    setLoading(false);
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
        fetchTransactions
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