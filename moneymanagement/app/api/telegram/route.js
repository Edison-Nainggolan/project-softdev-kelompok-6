export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan } from '../../../lib/groq';

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
s
  } catch (globalError) {
    console.error('❌ ERROR GLOBAL WEBHOOK:', globalError);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}