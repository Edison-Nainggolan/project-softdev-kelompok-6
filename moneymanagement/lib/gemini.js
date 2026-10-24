import { GoogleGenerativeAI } from '@google/generative-ai';

// Fungsi cadangan Regex jika AI gagal setelah beberapa kali percobaan
function ekstrakDenganRegex(text) {
  const angkaMatch = text.match(/\d+/g);
  if (!angkaMatch) return null;

  const harga = parseInt(angkaMatch.join(''), 10);
  const cleanTitle = text.replace(/[0-9]/g, '').trim();

  return {
    title: cleanTitle || 'Pengeluaran Manual',
    price: harga,
    category: 'Umum'
  };
}

export async function ekstrakDataKeuangan(userText) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    const hasilRegex = ekstrakDenganRegex(userText);
    if (hasilRegex) return hasilRegex;
    throw new Error('GEMINI_API_KEY belum terpasang.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  // SISTEM LOOP / RETRY (Maksimal mencoba 3 kali jika terjadi error sesaat)
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Percobaan ke-${attempt} memanggil Gemini API...`);
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Jika berhasil parse JSON, langsung kembalikan hasilnya (keluar dari loop)
      return JSON.parse(cleanJson);

    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Percobaan ke-${attempt} gagal:`, err.message);
      
      // Jika bukan percobaan terakhir, tunggu sebentar (delay) sebelum mengulang agar API tidak bertumpuk/spam
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Jeda 1 detik, lalu 2 detik
      }
    }
  }

  // JIKA SETELAH 3 KALI COBA TETAP GAGAL, ALIHKAN KE REGEX CADANGAN
  console.warn('⚠️ Gemini gagal setelah 3 kali percobaan, beralih ke Regex cadangan.');
  const hasilRegex = ekstrakDenganRegex(userText);
  if (hasilRegex) {
    return hasilRegex;
  }

  return { error: "Maaf, server AI sedang sibuk. Coba kirim ulang pesanmu ya!" };
}