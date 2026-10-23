import { supabase } from '../lib/supabase';

// Mematikan cache agar halaman selalu menarik data terbaru setiap kali di-refresh
export const revalidate = 0; 

export default async function DashboardPage() {
  // 1. Menyedot data dari Supabase, diurutkan dari yang paling baru
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
  }

  // Jika data kosong, gunakan array kosong agar tidak error
  const dataTransaksi = transactions || [];

  // 2. Menghitung total pengeluaran dari data asli
  const totalPengeluaran = dataTransaksi.reduce((total, trx) => total + trx.price, 0);

  // 3. Fungsi untuk mengubah format tanggal bawaan Supabase menjadi rapi (Contoh: 23 Okt 2026)
  const formatTanggal = (isoDate) => {
    const dateObj = new Date(isoDate);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Keuangan 💸</h1>
        
        {/* Kartu Ringkasan Saldo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col justify-center items-start">
          <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Pengeluaran</h2>
          <p className="text-4xl font-bold text-red-500">
            Rp{totalPengeluaran.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-gray-800">Riwayat Transaksi Terbaru</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Pengeluaran</th>
                  <th className="p-4 font-semibold">Kategori</th>
                  <th className="p-4 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {dataTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      Belum ada transaksi. Ayo catat pengeluaran pertamamu lewat Telegram!
                    </td>
                  </tr>
                ) : (
                  dataTransaksi.map((trx) => (
                    <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{formatTanggal(trx.created_at)}</td>
                      <td className="p-4 font-medium text-gray-800">{trx.title}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-wide">
                          {trx.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-700 whitespace-nowrap">
                        Rp{trx.price.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}