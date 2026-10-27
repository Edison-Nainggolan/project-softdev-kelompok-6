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

        // Hitung total kategori dari database
        const { data: catTransactions } = await supabase
          .from('transactions')
          .select('price')
          .eq('telegram_id', String(chatId))
          .eq('category', dataKeuangan.category);

        const totalTerpakai = (catTransactions || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
        const limitAnggaran = BUDGET_LIMITS[dataKeuangan.category] || 500000;
        const persentase = Math.round((totalTerpakai / limitAnggaran) * 100);

        // Format balasan lengkap dengan emoji
        replyMessage = `✅ Pengeluaran berhasil dicatat!\n\n📌 Judul: ${dataKeuangan.title}\n💰 Nominal: Rp${dataKeuangan.price.toLocaleString('id-ID')}\n📂 Kategori: ${dataKeuangan.category}`;

        // Peringatan budget jika mendekati / melebihi limit
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

    // Kirim Balasan ke Telegram
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
}export const dynamic = 'force-dynamic';
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

const DEFAULT_SALDO_AWAL = 1500000;

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.message || (!body.message.text && !body.message.voice)) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const chatId = body.message.chat.id;
    const userId = String(chatId);
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
        userText = body.message.text.trim();
      }

      // ==========================================
      // PENANGANAN MENU PERINTAH TELEGRAM
      // ==========================================
      if (userText.startsWith('/start') || userText.startsWith('/bantuan')) {
        replyMessage = `🤖 *Selamat Datang di FinTraces Bot!*\n\n` +
                       `Asisten pencatat keuangan pribadi kamu. Cukup ketik atau kirim *Voice Note* pengeluaranmu, contoh:\n` +
                       `• "Makan siang 15 ribu"\n` +
                       `• "Bayar kos 500rb kemarin"\n\n` +
                       `*Daftar Perintah / Menu:*\n` +
                       `/saldo - Cek sisa saldo dan pengeluaran\n` +
                       `/riwayat - Lihat daftar transaksi terakhir\n` +
                       `/budget - Cek status batas anggaran\n` +
                       `/insight - Analisis AI & tips keuangan\n` +
                       `/bantuan - Cara mencatat transaksi`;
      } 
      else if (userText.startsWith('/saldo')) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('price')
          .eq('telegram_id', userId);

        const totalKeluar = (txs || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
        const sisaSaldo = DEFAULT_SALDO_AWAL - totalKeluar;

        replyMessage = `💰 *Ringkasan Saldo Kamu*\n\n` +
                       `📥 Kiriman Bulanan: Rp${DEFAULT_SALDO_AWAL.toLocaleString('id-ID')}\n` +
                       `📤 Pengeluaran: Rp${totalKeluar.toLocaleString('id-ID')}\n` +
                       `💎 *Sisa Saldo:* Rp${sisaSaldo.toLocaleString('id-ID')}`;
      } 
      else if (userText.startsWith('/riwayat')) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .eq('telegram_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!txs || txs.length === 0) {
          replyMessage = `📄 Belum ada catatan transaksi yang tersimpan.`;
        } else {
          replyMessage = `📄 *5 Transaksi Terakhir Kamu:*\n\n`;
          txs.forEach((item, index) => {
            replyMessage += `${index +1}. *${item.title}* (${item.category})\n   Rp${Number(item.price).toLocaleString('id-ID')}\n`;
          });
        }
      } 
      else if (userText.startsWith('/budget')) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('category, price')
          .eq('telegram_id', userId);

        const stats = {};
        (txs || []).forEach(item => {
          stats[item.category] = (stats[item.category] || 0) + Number(item.price || 0);
        });

        replyMessage = `📊 *Status Batas Anggaran (Budget):*\n\n`;
        for (const [cat, limit] of Object.entries(BUDGET_LIMITS)) {
          const spent = stats[cat] || 0;
          const percent = Math.round((spent / limit) * 100);
          const statusIcon = percent >= 100 ? '🚨' : percent >= 80 ? '⚠️' : '✅';
          replyMessage += `${statusIcon} *${cat}*\n   Rp${spent.toLocaleString('id-ID')} / Rp${limit.toLocaleString('id-ID')} (${percent}%)\n\n`;
        }
      } 
      else if (userText.startsWith('/insight')) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('price, category')
          .eq('telegram_id', userId);

        const totalKeluar = (txs || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
        
        let topCategory = 'Belum ada';
        let maxVal = 0;
        const catMap = {};
        (txs || []).forEach(i => {
          catMap[i.category] = (catMap[i.category] || 0) + Number(i.price);
          if (catMap[i.category] > maxVal) {
            maxVal = catMap[i.category];
            topCategory = i.category;
          }
        });

        replyMessage = `💡 *Analisis & Insight AI:*\n\n` +
                       `• Total Pengeluaran: Rp${totalKeluar.toLocaleString('id-ID')}\n` +
                       `• Pengeluaran Terbesar: *${topCategory}* (Rp${maxVal.toLocaleString('id-ID')})\n\n` +
                       `_Tips: Kurangi jajan di kategori terbesarmu agar uang kiriman aman sampai akhir bulan!_`;
      } 
      else {
        // ==========================================
        // PROSES PENCATATAN PENGELUARAN OTOMATIS VIA AI
        // ==========================================
        const dataKeuangan = await ekstrakDataKeuangan(userText);
        
        if (dataKeuangan.error) {
          replyMessage = `⚠️ *Format Tidak Dikenali*\n${dataKeuangan.error}\n\nGunakan perintah /bantuan atau menu untuk melihat daftar perintah.`;
        } else {
          const { error: dbError } = await supabase
            .from('transactions')
            .insert([
              {
                telegram_id: userId,
                title: dataKeuangan.title,
                price: dataKeuangan.price,
                category: dataKeuangan.category
              }
            ]);

          if (dbError) throw dbError; 

          const { data: catTransactions } = await supabase
            .from('transactions')
            .select('price')
            .eq('telegram_id', userId)
            .eq('category', dataKeuangan.category);

          const totalTerpakai = (catTransactions || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
          const limitAnggaran = BUDGET_LIMITS[dataKeuangan.category] || 500000;
          const persentase = Math.round((totalTerpakai / limitAnggaran) * 100);

          replyMessage = `✅ Pengeluaran berhasil dicatat!\n\n📌 Judul: ${dataKeuangan.title}\n💰 Nominal: Rp${dataKeuangan.price.toLocaleString('id-ID')}\n📂 Kategori: ${dataKeuangan.category}`;

          if (persentase >= 100) {
            replyMessage += `\n\n🚨 *Peringatan:* budget ${dataKeuangan.category} sudah terpakai *${persentase}%*!`;
          } else if (persentase >= 80) {
            replyMessage += `\n\n⚠️ *Peringatan:* budget ${dataKeuangan.category} sudah *${persentase}%* terpakai.`;
          }
        }
      }
      
    } catch (prosesError) {
      console.error('❌ ERROR PROSES AI/DB:', prosesError);
      replyMessage = `⚠️ *Terjadi Kendala Sistem*\n${prosesError.message}`;
    }

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