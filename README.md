<p align="center">
  <img src="./public/icons/192x192.png" alt="Aplikasi Keuangan Cymblot" />
</p>

# Aplikasi Keuangan Cymblot

Aplikasi Keuangan Cymblot adalah solusi sederhana dan praktis untuk membantu Anda mengelola keuangan sehari-hari. Aplikasi ini dibuat dengan tujuan untuk memudahkan Anda dalam melacak pemasukan, pengeluaran, dan memvisualisasikan data keuangan.

## Akses Aplikasi

Anda dapat mengakses aplikasi ini melalui [https://keuangan.fikrisyahid.my.id/](https://keuangan.fikrisyahid.my.id/)

## Teknologi yang Digunakan

- **Frontend**: Next.js dan Mantine UI sebagai UI Framework
- **Backend**: Drizzle ORM
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

4. Generate drizzle client:

   ```bash
   bun run db:generate
   ```

   atau

   ```bash
   npm run db:generate
   ```

5. Jalankan aplikasi:

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

Aplikasi ini dilisensikan di bawah [MIT License](https://github.com/fs3120/cymblot-keuangan/blob/2.0/LICENSE.md)