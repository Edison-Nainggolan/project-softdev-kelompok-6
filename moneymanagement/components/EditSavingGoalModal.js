'use client';

import { useState } from 'react';

export default function EditSavingGoalModal({ onClose, onSave, sisaSaldo }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetMonths, setTargetMonths] = useState(1);

  // Perhitungan rekomendasi per bulan
  const nominalTarget = Number(target) || 0;
  const nominalCurrent = Number(current) || 0;
  const sisaKebutuhan = Math.max(0, nominalTarget - nominalCurrent);
  const butuhPerBulan = Math.ceil(sisaKebutuhan / Number(targetMonths));

  const isRealistis = sisaSaldo >= butuhPerBulan;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !target) return alert('Nama impian dan target nominal wajib diisi!');

    onSave({
      title,
      target: nominalTarget,
      current: nominalCurrent,
      target_months: Number(targetMonths),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-bold text-gray-900 mb-4">🎯 Atur Target Tabungan Baru</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Target / Impian</label>
            <input
              type="text"
              placeholder="Contoh: Beli Kit Proyek / Dana Kos"
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-gray-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Total Nominal (Rp)</label>
            <input
              type="number"
              placeholder="Contoh: 600000"
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-gray-800"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Waktu Pencapaian</label>
            <select
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-gray-800 bg-white"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            >
              <option value={1}>Bulan ini (1 Bulan)</option>
              <option value={2}>2 Bulan lagi</option>
              <option value={3}>3 Bulan lagi (1 Triwulan)</option>
              <option value={6}>6 Bulan lagi (Akhir Semester)</option>
              <option value={12}>1 Tahun (Akhir Tahun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Sudah Terkumpul Saat Ini (Rp)</label>
            <input
              type="number"
              placeholder="0 (Jika belum ada)"
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-gray-800"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>

          {/* Kotak Analisis Keuangan Otomatis */}
          {nominalTarget > 0 && (
            <div className={`p-3 rounded-xl border text-xs ${isRealistis ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <p className="font-bold mb-0.5">
                {isRealistis ? '✅ Target Realistis!' : '⚠️ Perlu Penyesuaian Saldo'}
              </p>
              <p className="text-[11px] leading-tight">
                Kamu perlu menyisihkan <span className="font-semibold">Rp{butuhPerBulan.toLocaleString('id-ID')}/bulan</span> selama {targetMonths} bulan.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}