import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../../lib/supabase'; // <-- Jembatan ke database

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = body.message.chat.id;
    const userText = body.message.text;
    let replyMessage = '';

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' }); 

      const prompt = `
        Kamu adalah asisten pencatat keuangan pintar. Tugasmu mengekstrak informasi pengeluaran dari pesan pengguna dan mengubahnya menjadi format JSON.
        
        Pesan pengguna: "${userText}"
        
        Aturan ketat:
        1. Kategori wajib dipilih dari salah satu ini: Makanan, Transportasi, Hiburan, Belanja, Tagihan, atau Umum.
        2. Harga (price) harus berupa angka murni (tanpa Rp, koma, atau titik). Jika pengguna menyebut "15rb" atau "20 ribu", jadikan 15000 atau 20000.
        3. HANYA KEMBALIKAN TEKS JSON MURNI tanpa markdown (seperti \`\`\`json).
        
        Format JSON yang wajib diikuti:
        {
          "title": "nama pengeluaran singkat",
          "price": nominal_angka,
          "category": "Kategori Sesuai Aturan"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const dataKeuangan = JSON.parse(cleanJsonText);
      
      // === PROSES MENYIMPAN DATA KE SUPABASE ===
      const { error: dbError } = await supabase
        .from('transactions')
        .insert([
          {
            title: dataKeuangan.title,
            price: dataKeuangan.price,
            category: dataKeuangan.category
          }
        ]);

      if (dbError) {
        console.error('❌ ERROR DATABASE:', dbError);
        replyMessage = `⚠️ AI berhasil membaca, tapi gagal menyimpan ke database: ${dbError.message}`;
      } else {
        replyMessage = `✅ Pengeluaran berhasil dicatat & disimpan ke Database!\n\n📌 Judul: ${dataKeuangan.title}\n💰 Nominal: Rp${dataKeuangan.price.toLocaleString('id-ID')}\n📂 Kategori: ${dataKeuangan.category}`;
      }
      // =========================================
      
    } catch (aiError) {
      console.error('❌ ERROR GEMINI/SISTEM:', aiError);
      replyMessage = `Maaf, terjadi kesalahan saat memproses AI: ${aiError.message}`;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: replyMessage }),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('❌ ERROR UTAMA:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}