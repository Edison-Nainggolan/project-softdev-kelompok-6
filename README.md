# 💸 FinTraces - Smart Student Financial Tracker

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)

FinTraces (Financial Traces) adalah solusi pencatatan keuangan cerdas berbasis AI yang dirancang khusus untuk mahasiswa. Alih-alih mengisi form manual yang merepotkan, pengguna cukup mengirim pesan teks atau **Pesan Suara (Voice Note)** ke Bot Telegram. AI akan otomatis mengekstrak nominal, judul, dan kategori, lalu menampilkannya secara *real-time* di Web Dashboard.

Proyek ini dikembangkan sebagai **Final Project UKM Software Development (Softdev)** dengan fokus tema **Smart Student Productivity**.

🔗 **Live Demo Dashboard:** [Tautan Vercel Kamu] (Ganti dengan link Vercel-mu, misal: https://project-softdev-kelompok-6.vercel.app)  
🤖 **Coba Bot Telegram:** [Tautan Bot Kamu] (Ganti dengan link Bot-mu, misal: https://t.me/softdevkeuanganbot)

---

## ✨ Fitur Utama

- 🎙️ **AI Voice & Text Tracking:** Catat pengeluaran hanya dengan mengirim pesan suara (*voice note*) atau teks santai (contoh: *"Beli nasi padang 15 ribu"*). Model AI Groq (Whisper & Llama 3) akan melakukan ekstraksi data secara otomatis.
- 📊 **Real-time Web Dashboard:** Sinkronisasi instan antara Telegram dan Dashboard Web. Dibangun dengan UI responsif (Mobile-first hingga Desktop layar lebar).
- 🛡️ **Aman Jajan Hari Ini:** Kalkulator batas aman pengeluaran harian yang otomatis beradaptasi berdasarkan sisa saldo dan sisa hari dalam bulan tersebut.
- 🎯 **Saving Goals & Budgeting:** Pantau target tabungan (seperti dana darurat) dan batas pengeluaran per kategori (Makanan, Transportasi, Kuliah, dll).
- 🧠 **Smart Category Normalization:** AI dan algoritma normalisasi string memastikan setiap input kategori dari pengguna masuk ke dalam kelompok budget yang tepat secara presisi.
- 📈 **Interactive Insights:** Visualisasi data pengeluaran mingguan menggunakan Recharts dan Donut Chart.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js (App Router)](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling & Responsivitas
- [Framer Motion](https://www.framer.com/motion/) - Animasi UI/UX
- [Recharts](https://recharts.org/) - Visualisasi Grafik Data

**Backend & AI:**
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless Functions & Webhook handler
- [Supabase](https://supabase.com/) - Database PostgreSQL (BaaS)
- [Groq API](https://groq.com/) - Llama 3 (NLP) & Whisper (Speech-to-Text)
- [Telegram Bot API](https://core.telegram.org/bots/api) - Antarmuka Chatbot

---

## 🏗️ Arsitektur Aplikasi

1. **Input:** Pengguna mengirim chat/voice note ke Bot Telegram.
2. **Webhook:** Pesan ditangkap oleh Next.js API Route (`/api/telegram`).
3. **Processing (AI):** 
   - Jika *Voice Note*, file audio diunduh dan ditranskripsi oleh Groq Whisper.
   - Teks (dari user atau hasil transkripsi) dikirim ke Groq Llama 3 untuk diekstrak menjadi format JSON (`title`, `price`, `category`).
4. **Database:** Data JSON disimpan ke tabel `transactions` di Supabase.
5. **Dashboard:** Web mengambil data dari Supabase dan menampilkannya secara interaktif kepada pengguna.

---

## 🚀 Panduan Instalasi (Development)

Jika ingin menjalankan proyek ini di komputer lokal, ikuti langkah-langkah berikut:

### 1. Clone Repositori
```bash
git clone https://github.com/USERNAME_GITHUB/project-softdev-kelompok-6.git
cd project-softdev-kelompok-6
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di *root directory* dan isi dengan kredensial berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

---

## 👥 Tim Pengembang (Kelompok 6)
- **Hustler 
- **Hipster
- **Hacker

*Dibuat untuk Final Project UKM Software Development 2026.*
