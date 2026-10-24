export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan } from '../../../lib/gemini'; 

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Abaikan webhook jika bukan pesan teks, dan WAJIB kembalikan 200 OK
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    const userText = body.message.text;
    let replyMessage = '';

    try {
      // 2. Panggil Gemini AI
      const dataKeuangan = await ekstrakDataKeuangan(userText);
      
      // 3. Cek respon AI
      if (dataKeuangan.error) {
        replyMessage = dataKeuangan.error;
      } else {
        // 4. Simpan ke Database Supabase
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
      console.error('❌ ERROR PROSES:', prosesError);
      
      // PESAN DEBUG DIMATIKAN, GANTI DENGAN PESAN SANTAI
      replyMessage = "⚠️ Waduh, kuota/server bot lagi penuh nih. Tunggu sebentar lalu coba kirim lagi ya! 🙏";
    }

    // 5. Kirim Balasan ke Telegram
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: replyMessage }),
    });

    // 6. KUNCI UTAMA ANTI SPAM (Wajib mengembalikan status 200)
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (globalError) {
    console.error('❌ ERROR GLOBAL:', globalError);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}