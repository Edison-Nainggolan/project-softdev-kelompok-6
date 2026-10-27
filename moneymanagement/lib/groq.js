import Groq from 'groq-sdk';

// Fungsi cadangan Regex (TETAP DIPERTAHANKAN sebagai pengaman)
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
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    const hasilRegex = ekstrakDenganRegex(userText);
    if (hasilRegex) return hasilRegex;
    throw new Error('GROQ_API_KEY belum terpasang.');
  }

  const groq = new Groq({ apiKey: apiKey });

  const prompt = `
    Kamu adalah asisten pencatat keuangan pintar. Ekstrak informasi pengeluaran dari pesan ini dan ubah ke format JSON.
    
    Pesan pengguna: "${userText}"
    
    Aturan ketat:
    1. Kategori wajib dipilih dari: Makanan, Transportasi, Hiburan, Belanja, Tagihan, atau Umum.
    2. Harga (price) harus berupa angka murni.
    3. Jika tidak ada harga/barang yang jelas, kembalikan JSON ini: { "error": "Maaf, format pengeluaran tidak terbaca." }
    
    Format JSON wajib:
    {
      "title": "nama pengeluaran singkat",
      "price": nominal_angka,
      "category": "Kategori Sesuai Aturan"
    }
  `;

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Percobaan ke-${attempt} memanggil Groq (Llama 3)...`);
      
      const result = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b', // Model yang sangat cepat dan gratis
        response_format: { type: 'json_object' } // Keunggulan Groq: memaksa output pasti berupa JSON
      });

      const cleanJson = result.choices[0]?.message?.content || "{}";
      return JSON.parse(cleanJson);

    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Percobaan ke-${attempt} gagal:`, err.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.warn('⚠️ AI gagal setelah 3 kali percobaan, beralih ke Regex cadangan.');
  const hasilRegex = ekstrakDenganRegex(userText);
  if (hasilRegex) {
    return hasilRegex;
  }

  return { error: "Maaf, server AI sedang sibuk. Coba kirim ulang pesanmu ya!" };
}