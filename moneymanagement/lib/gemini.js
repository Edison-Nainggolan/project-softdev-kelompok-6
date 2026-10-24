export async function ekstrakDataKeuangan(userText) {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('GROQ_API_KEY belum terpasang di Environment Variables Vercel.');
  }

  // Menggunakan API endpoint Groq (Llama 3 8B - sangat cepat & gratis)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten pencatat keuangan pintar. Tugasmu mengekstrak informasi pengeluaran dari pesan pengguna dan wajib mengembalikan output dalam format JSON murni tanpa teks tambahan. Aturan: 1. Kategori wajib salah satu dari: Makanan, Transportasi, Hiburan, Belanja, Tagihan, Umum. 2. Harga (price) harus angka murni tanpa titik/koma/Rp. 3. Jika tidak ada info nominal, kembalikan JSON: {"error": "Maaf, format pengeluaran tidak terbaca. Sebutkan nama barang dan harganya ya!"}. Format sukses: {"title": "nama", "price": angka, "category": "Kategori"}'
        },
        {
          role: 'user',
          content: userText
        }
      ],
      response_format: { type: "json_object" }, // Memastikan output 100% JSON valid
      temperature: 0.1,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gagal terhubung ke server Groq');
  }

  const responseText = data.choices[0].message.content;
  return JSON.parse(responseText);
}