import { GoogleGenerativeAI } from '@google/generative-ai';

export async function ekstrakDataKeuangan(userText) {
  // Ambil key dan hilangkan spasi yang tidak sengaja terbawa
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  console.log('[DEBUG] Status GEMINI_API_KEY:', apiKey ? `Terbaca (${apiKey.substring(0, 6)}...)` : 'KOSONG');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum terpasang di Environment Variables Vercel.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.8-flash',
  generationConfig: {
    responseMimeType: 'application/json',
  },
});

  const prompt = `
    Kamu adalah asisten pencatat keuangan pintar. Tugasmu mengekstrak informasi pengeluaran dari pesan pengguna dan mengubahnya menjadi format JSON.
    
    Pesan pengguna: "${userText}"
    
    Aturan ketat:
    1. Kategori wajib dipilih dari salah satu ini: Makanan, Transportasi, Hiburan, Belanja, Tagihan, atau Umum.
    2. Harga (price) harus berupa angka murni (tanpa Rp, koma, atau titik).
    3. Jika pesan pengguna TIDAK mengandung informasi pengeluaran/harga yang jelas, keluarkan format JSON ini:
       { "error": "Maaf, format pengeluaran tidak terbaca. Sebutkan nama barang dan harganya ya!" }
    
    Format JSON sukses yang wajib diikuti:
    {
      "title": "nama pengeluaran singkat",
      "price": nominal_angka,
      "category": "Kategori Sesuai Aturan"
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  return JSON.parse(responseText);
}