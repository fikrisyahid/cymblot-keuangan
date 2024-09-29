# Aplikasi Keuangan Cymblot

Aplikasi Keuangan Cymblot adalah solusi sederhana dan praktis untuk membantu Anda mengelola keuangan sehari-hari. Aplikasi ini dibuat dengan tujuan untuk memudahkan Anda dalam melacak pemasukan, pengeluaran, dan memvisualisasikan data keuangan.

## Fitur Aplikasi

- **Pelacakan Saldo**: Pantau saldo keuangan Anda secara langsung dan terperinci.
- **Pengelompokan Transaksi**: Kategorikan pemasukan dan pengeluaran berdasarkan periode waktu tertentu.
- **Visualisasi Grafik**: Lihat tren keuangan Anda melalui grafik yang mudah dibaca.
- **Filter Data**: Saring data mentah keuangan sesuai dengan kriteria yang diinginkan.

## Teknologi yang Digunakan

- **Frontend**: Next.js dan Mantine UI sebagai UI Framework
- **Backend**: Prisma ORM
- **Database**: Supabase (PostgreSQL)

## Cara Install

1. Clone repository ini:

   ```bash
   git clone https://github.com/fs3120/cymblot-keuangan.git
   ```

2. Masuk ke direktori projek:

   ```bash
   cd cymblot-keuangan
   ```

3. Install dependencies:

   Apabila anda menggunakan `bun` (default package manager projek ini):

   ```bash
    bun install
   ```

   atau apabila anda menggunakan `yarn`:

   ```bash
    yarn
   ```

   atau apabila anda menggunakan `npm`:

   ```bash
     npm install
   ```

4. Buat file `.env` dan isi dengan konfigurasi development (silahkan kontak saya untuk mendapatkan konfigurasi tersebut)
5. Generate prisma client:

   ```bash
   bunx prisma generate
   ```

   atau

   ```bash
   npx prisma generate
   ```

6. Jalankan aplikasi:

   ```bash
   bun run dev
   ```

   atau

   ```bash
   npm run dev
   ```

## Kontribusi

Jika Anda tertarik untuk berkontribusi dalam pengembangan aplikasi ini, ikuti langkah-langkah berikut:

1. Fork repository ini.
2. Buat branch baru dengan nama yang deskriptif: `git checkout -b fitur-baru`.
3. Setelah selesai, buat pull request agar perubahan Anda bisa direview dan di-merge ke dalam repository utama.

## Lisensi

Aplikasi ini dilisensikan di bawah [MIT License](https://github.com/fs3120/cymblot-keuangan/blob/1.3/LICENSE.md)
