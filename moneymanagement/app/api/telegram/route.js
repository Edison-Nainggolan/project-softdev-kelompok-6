export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 
import { ekstrakDataKeuangan, transkripVoiceNote } from '../../../lib/groq'; 
import fs from 'fs';
import path from 'path';
import os from 'os';

// Batas Budget per Kategori (disesuaikan dengan kebutuhan)
const BUDGET_LIMITS = {
  'Makanan & Minuman': 700000,
  'Makan': 700000,
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
    
    // Periksa: Tolak jika BUKAN pesan teks DAN BUKAN pesan suara
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
        const fileId = body.message.voice.file_id;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        // 1a. Minta lokasi file dari Telegram
        const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
        const fileRes = await fetch(getFileUrl);
        const fileData = await fileRes.json();
        
        if (!fileData.ok) throw new Error("Gagal mengambil info file dari Telegram");
        const filePathTelegram = fileData.result.file_path;

        // 1b. Unduh file audio (.ogg)
        const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePathTelegram}`;
        const audioRes = await fetch(downloadUrl);
        const arrayBuffer = await audioRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1c. Simpan sementara di folder /tmp
        const tempFilePath = path.join(os.tmpdir(), `${fileId}.ogg`);
        fs.writeFileSync(tempFilePath, buffer);

        // 1d. Transkrip suara ke teks dengan Groq Whisper
        userText = await transkripVoiceNote(tempFilePath);

        // 1e. Hapus file temporary
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (!userText) {
          throw new Error("Suara tidak terdengar jelas oleh AI.");
        }
      } else if (body.message.text) {
        userText = body.message.text;
      }

      // ==========================================
      // TAHAP 2: ESTRASI AI & SIMPAN KE SUPABASE
      // ==========================================
      const dataKeuangan = await ekstrakDataKeuangan(userText);
      
      if (dataKeuangan.error) {
        replyMessage = `⚠️ ${dataKeuangan.error}`;
      } else {
        // Simpan transaksi baru ke database
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

        // ==========================================
        // TAHAP 3: LOGIKA PERINGATAN ANGGARAN PROAKTIF
        // ==========================================
        const { data: catTransactions } = await supabase
          .from('transactions')
          .select('price')
          .eq('telegram_id', String(chatId))
          .eq('category', dataKeuangan.category);

        const totalTerpakai = (catTransactions || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
        const limitAnggaran = BUDGET_LIMITS[dataKeuangan.category] || 500000;
        const persentase = Math.round((totalTerpakai / limitAnggaran) * 100);

        // Format pesan sukses
        replyMessage = `Tercatated!\n${dataKeuangan.category} · ${dataKeuangan.title}\nRp${dataKeuangan.price.toLocaleString('id-ID')} - Hari ini`;

        // Tambahkan peringatan jika mendekati / melebihi anggaran
        if (persentase >= 100) {
          replyMessage += `\n\n🚨 *Peringatan:* budget ${dataKeuangan.category} telah melebihi batas (Terpakai ${persentase}%)!`;
        } else if (persentase >= 80) {
          replyMessage += `\n\n⚠️ *Peringatan:* budget ${dataKeuangan.category} sudah ${persentase}% terpakai.`;
        }
      }
      
    } catch (prosesError) {
      console.error('❌ ERROR PROSES AI/DB:', prosesError);
      replyMessage = `⚠️ Terjadi kendala sistem: ${prosesError.message}`;
    }

    // ==========================================
    // TAHAP 4: BALAS PESAN KE TELEGRAM
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