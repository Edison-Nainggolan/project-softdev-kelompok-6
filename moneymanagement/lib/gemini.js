import { GoogleGenerativeAI } from '@google/generative-ai';

export async function ekstrakDataKeuangan(userText) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY belum terpasang.');

  const genAI = new GoogleGenerativeAI(apiKey);
  // Gunakan model standar yang paling stabil
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Ekstrak informasi pengeluaran dari teks ini: "${userText}". 
  Aturan: 
  1. Kategori wajib salah satu dari: Makanan, Transportasi, Hiburan, Belanja, Tagihan, Umum.
  2. Harga harus angka murni tanpa titik/koma/Rp.
  3. Jika tidak ada nominal, balas dengan JSON: {"error": "Format tidak terbaca, sebutkan nominalnya ya!"}
  Keluarkan HANYA format JSON murni tanpa teks lain:
  {"title": "nama", "price": angka, "category": "Kategori"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Bersihkan teks jika ada pembungkus markdown ```json ... ```
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}