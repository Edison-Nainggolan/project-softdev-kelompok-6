
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan } from '../../../lib/gemini'; 

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
      // 1. Panggil Gemini AI
      const dataKeuangan = await ekstrakDataKeuangan(userText);
      
      // 2. Cek respon AI
      if (dataKeuangan.error) {
        replyMessage = dataKeuangan.error;
      } else {
        // 3. Simpan ke Database Supabase
        const { error: dbError } = await supabase
          .from('transactions')
          .insert([
            {
              telegram_id: chatId,
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
      
      // Tampilkan error asli langsung di Telegram agar mudah dilacak
      const msg = prosesError?.message || JSON.stringify(prosesError);
      
      if (msg.includes('503') || msg.includes('overloaded')) {
        replyMessage = "Waduh, server AI sedang sibuk banget nih. Tunggu 1 menit lalu coba lagi ya. 🙏";
      } else {
        replyMessage = `⚠️ Gangguan Teknis:\n${msg}`;
      }
    }

    // 4. Kirim Balasan ke Telegram
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
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