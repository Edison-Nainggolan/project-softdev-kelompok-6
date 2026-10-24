export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan } from '../../../lib/gemini'; 

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    const userText = body.message.text;
    let replyMessage = '';

    try {
      const dataKeuangan = await ekstrakDataKeuangan(userText);
      
      if (dataKeuangan.error) {
        replyMessage = dataKeuangan.error;
      } else {
        const { error: dbError } = await supabase
          .from('transactions')
          .insert([
            {
              telegram_id: String(chatId),
              title: dataKeuangan.title,
              price: dataKeuangan.price,
              category: dataKeuangan.category
            }
          ]);

        if (dbError) throw dbError; 

        replyMessage = `✅ Pengeluaran berhasil dicatat!\n\n📌 Judul: ${dataKeuangan.title}\n💰 Nominal: Rp${dataKeuangan.price.toLocaleString('id-ID')}\n📂 Kategori: ${dataKeuangan.category}`;
      }
      
    } catch (prosesError) {
      console.error('❌ ERROR PROSES AI/DB:', prosesError);
      replyMessage = `⚠️ Terjadi kendala sistem: ${prosesError.message}`;
    }

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: replyMessage }),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fungsi cadangan menggunakan Regex manual jika AI Gemini error/limit habis
function ekstrakDenganRegex(text) {
  const angkaMatch = text.match(/\d+/g);
  if (!angkaMatch) return null;

  // Gabungkan angka jika terpecah, ambil sebagai harga/nominal
  const harga = parseInt(angkaMatch.join(''), 10);
  
  // Bersihkan teks dari angka untuk dijadikan judul
  const cleanTitle = text.replace(/[0-9]/g, '').trim();

  return {
    title: cleanTitle || 'Pengeluaran Manual',
    price: harga,
    category: 'Umum'
  };
}

export async function ekstrakDataKeuangan(userText) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Jika API Key tidak ada sama sekali, langsung pakai Regex
  if (!apiKey) {
    const hasilRegex = ekstrakDenganRegex(userText);
    if (hasilRegex) return hasilRegex;
    throw new Error('GEMINI_API_KEY belum terpasang dan format pesan tidak memiliki nominal.');
  }

  try {
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (aiError) {
    console.warn('⚠️ AI Gemini gagal/limit, beralih ke Regex cadangan:', aiError.message);
    
    // CADANGAN: Jika Gemini error, jalankan Regex agar sistem tetap merespons
    const hasilRegex = ekstrakDenganRegex(userText);
    if (hasilRegex) {
      return hasilRegex;
    }
    
    return { error: "Maaf, server AI sedang sibuk dan format pesan tidak memiliki nominal angka." };
  }
}
  } catch (globalError) {
    console.error('❌ ERROR GLOBAL WEBHOOK:', globalError);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}