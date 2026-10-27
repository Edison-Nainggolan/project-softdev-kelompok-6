export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan, transkripVoiceNote } from '../../../lib/groq'; 
import fs from 'fs';
import path from 'path';
import os from 'os';

const BUDGET_LIMITS = {
  'Makanan & Minuman': 700000,
  'Makan': 700000,
  'Minuman & Kopi': 200000,
  'Transportasi': 200000,
  'Transport': 200000,
  'Kuliah': 300000,
  'Hiburan': 150000,
  'Belanja': 300000,
  'Tagihan': 500000,
  'Umum': 500000,
};

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.message || (!body.message.text && !body.message.voice)) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    let userText = '';
    let replyMessage = '';

    try {
      if (body.message.voice) {
        const fileId = body.message.voice.file_id;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
        const fileRes = await fetch(getFileUrl);
        const fileData = await fileRes.json();
        
        if (!fileData.ok) throw new Error("Gagal mengambil info file dari Telegram");
        const filePathTelegram = fileData.result.file_path;

        const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePathTelegram}`;
        const audioRes = await fetch(downloadUrl);
        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tempFilePath = path.join(os.tmpdir(), `${fileId}.ogg`);
        fs.writeFileSync(tempFilePath, buffer);

        userText = await transkripVoiceNote(tempFilePath);

        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (!userText) {
          throw new Error("Suara tidak terdengar jelas oleh AI.");
        }
      } else if (body.message.text) {
        userText = body.message.text;
      }

      const dataKeuangan = await ekstrakDataKeuangan(userText);
      
      if (dataKeuangan.error) {
        replyMessage = `⚠️ *Format Tidak Dikenali*\n${dataKeuangan.error}`;
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

        // Hitung total kategori
        const { data: catTransactions } = await supabase
          .from('transactions')
          .select('price')
          .eq('telegram_id', String(chatId))
          .eq('category', dataKeuangan.category);

        const totalTerpakai = (catTransactions || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
        const limitAnggaran = BUDGET_LIMITS[dataKeuangan.category] || 500000;
        const persentase = Math.round((totalTerpakai / limitAnggaran) * 100);

        // Format Pesan Sesuai Wireframe
        replyMessage = `*Tercatat*\n${dataKeuangan.category} · ${dataKeuangan.title}\n*Rp${dataKeuangan.price.toLocaleString('id-ID')}* · Hari ini`;

        if (persentase >= 100) {
          replyMessage += `\n\n🚨 *Peringatan:* budget ${dataKeuangan.category} sudah terpakai *${persentase}%* (Rp${totalTerpakai.toLocaleString('id-ID')}/${limitAnggaran.toLocaleString('id-ID')})!`;
        } else if (persentase >= 80) {
          replyMessage += `\n\n⚠️ *Peringatan:* budget ${dataKeuangan.category} sudah *${persentase}%* terpakai.`;
        }
      }
      
    } catch (prosesError) {
      console.error('❌ ERROR PROSES AI/DB:', prosesError);
      replyMessage = `⚠️ *Terjadi Kendala Sistem*\n${prosesError.message}`;
    }

    // Kirim Balasan dengan parse_mode Markdown
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: replyMessage,
        parse_mode: 'Markdown'
      }),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (globalError) {
    console.error('❌ ERROR GLOBAL WEBHOOK:', globalError);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}