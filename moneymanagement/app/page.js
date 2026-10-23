'use client';

import { useTransaction } from './context/TransactionContext';
import TelegramLogin from '../components/TelegramLogin';
import Dashboard from '../components/Dashboard';

export default function Page() {
  const { user, login } = useTransaction();

  // Tampilan 1: Jika BELUM login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-2">Money Management Softdev</h1>
        <p className="mb-6 text-gray-600">Silakan login untuk melihat catatan keuanganmu.</p>
        <TelegramLogin botName="softdevkeuanganbot" onAuth={login} />
      </div>
    );
  }

  // Tampilan 2: Jika SUDAH login
  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Halo, {user.first_name}! 👋</h1>
          <p className="text-sm text-gray-500">ID Telegram: {user.id}</p>
        </div>
        <Dashboard />
      </div>
    </main>
  );
}