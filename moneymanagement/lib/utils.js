export const BUDGET_LIMITS = {
  'Makanan & Minuman': 700000,
  'Transportasi': 200000,
  'Kuliah': 300000,
  'Hiburan': 150000,
  'Belanja': 300000,
  'Tagihan': 500000,
  'Umum': 300000,
};

export const getStandardCategory = (cat) => {
  if (!cat) return 'Umum';
  const c = String(cat).toLowerCase().trim();
  if (c.includes('makan') || c.includes('minum') || c.includes('kopi')) return 'Makanan & Minuman';
  if (c.includes('transport')) return 'Transportasi';
  if (c.includes('kuliah') || c.includes('buku') || c.includes('foto')) return 'Kuliah';
  if (c.includes('hibur') || c.includes('game') || c.includes('nonton')) return 'Hiburan';
  if (c.includes('belanja') || c.includes('shop')) return 'Belanja';
  if (c.includes('tagihan') || c.includes('kos') || c.includes('listrik')) return 'Tagihan';
  return 'Umum';
};