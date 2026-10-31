'use client';

export default function EditSaldoModal({ inputSaldo, setInputSaldo, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-left space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-gray-900">Atur Uang Kiriman / Saldo Awal</h3>
        <p className="text-xs text-gray-500">Masukkan nominal total uang sakumu untuk bulan ini.</p>
        <form onSubmit={onSave} className="space-y-3">
          <input
            type="number"
            placeholder="Contoh: 1500000"
            value={inputSaldo}
            onChange={(e) => setInputSaldo(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-gray-800"
            required
          />
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-900"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}