export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
// Pastikan transkripVoiceNote ikut di-import dari file groq.js
import { ekstrakDataKeuangan, transkripVoiceNote } from '../../../lib/groq'; 
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Perbarui pengecekan: Tolak jika BUKAN pesan teks DAN BUKAN pesan suara
    if (!body.message || (!body.message.text && !body.message.voice)) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    let userText = '';
    let replyMessage = '';

    try {
      // ==========================================
      // TAHAP 1: PENERIMAAN PESAN (TEKS / SUARA)
      // ==========================================
      if (body.message.voice) {
        // Jika user mengirim Voice Note
        const fileId = body.message.voice.file_id;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        // 1a. Minta lokasi (path) file audio dari server Telegram
        const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
        const fileRes = await fetch(getFileUrl);
        const fileData = await fileRes.json();
        
        if (!fileData.ok) throw new Error("Gagal mengambil info file dari Telegram");
        const filePathTelegram = fileData.result.file_path;

        // 1b. Unduh file audio (biasanya .ogg) dari Telegram
        const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePathTelegram}`;
        const audioRes = await fetch(downloadUrl);
        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1c. Simpan sementara di folder /tmp (khusus serverless seperti Vercel)
        const tempFilePath = path.join(os.tmpdir(), `${fileId}.ogg`);
        fs.writeFileSync(tempFilePath, buffer);

        // 1d. Telinga AI (Whisper) mendengarkan suara dan mengubah ke teks
        userText = await transkripVoiceNote(tempFilePath);

        // 1e. Bersihkan sampah agar server tidak penuh
        fs.unlinkSync(tempFilePath);

        if (!userText) {
          throw new Error("Suara tidak terdengar jelas oleh AI.");
        }
      } else if (body.message.text) {
        // Jika user mengetik manual seperti biasa
        userText = body.message.text;
      }

      // ==========================================
      // TAHAP 2: PROSES TEKS KE JSON & DATABASE
      // ==========================================
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

    // ==========================================
    // TAHAP 3: BALAS KE TELEGRAM PENGGUNA
    // ==========================================
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: replyMessage }),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (globalError) {
    console.error('❌ ERROR GLOBAL WEBHOOK:', globalError);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}