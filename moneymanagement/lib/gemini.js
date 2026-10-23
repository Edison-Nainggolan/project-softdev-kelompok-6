import { GoogleGenerativeAI } from '@google/generative-ai';

// Fungsi khusus untuk mengekstrak teks user jadi format JSON
export async function ekstrakDataKeuangan(userText) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    Kamu adalah asisten pencatat keuangan pintar. Tugasmu mengekstrak informasi pengeluaran dari pesan pengguna dan mengubahnya menjadi format JSON.
    
    Pesan pengguna: "${userText}"
    
    Aturan ketat:
    1. Kategori wajib dipilih dari salah satu ini: Makanan, Transportasi, Hiburan, Belanja, Tagihan, atau Umum.
    2. Harga (price) harus berupa angka murni (tanpa Rp, koma, atau titik).
    3. Jika pesan pengguna TIDAK mengandung informasi pengeluaran/harga yang jelas, keluarkan format JSON ini:
       { "error": "Maaf, format pengeluaran tidak terbaca. Sebutkan nama barang dan harganya ya!" }
    4. HANYA KEMBALIKAN TEKS JSON MURNI tanpa markdown (seperti \`\`\`json).
    
    Format JSON sukses yang wajib diikuti:
    {
      "title": "nama pengeluaran singkat",
      "price": nominal_angka,
      "category": "Kategori Sesuai Aturan"
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Bersihkan backtick jika AI masih bandel mengirim markdown
  const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Ubah teks menjadi objek JavaScript (JSON)
  return JSON.parse(cleanJsonText);
}