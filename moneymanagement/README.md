# Tokoin — E-Commerce Sederhana (Next.js + shadcn/ui)

## Menjalankan
```bash
npm install
npm run dev
```
Buka http://localhost:3000

## Requirement wajib → lokasi kode
1. **Fetch Data** → `app/components/Shop.js` (`useEffect` + `fetch('/products.json')`)
2. **Add to Cart (State Management)** → `app/context/CartContext.js` (React Context API + `useState`)
3. **Fitur Search** → `app/components/Shop.js` (state `query`, filter real-time)

## Stack
- Next.js **App Router** (SSR, folder `app/`)
- **shadcn/ui** (`components/ui/`: Button, Input, Card, Badge, Sheet) di atas Tailwind CSS + Radix UI
- State management: React Context API (`useContext` + `useState`), bukan Redux/Zustand

## Mengisi produk sendiri
Edit `public/products.json`. Setiap produk butuh 4 field:
```json
{ "id": 4, "title": "Nama Produk", "price": 15.99, "thumbnail": "https://url-gambar.jpg" }
```
`id` harus unik, `thumbnail` boleh dikosongkan `""` kalau belum ada gambar.
