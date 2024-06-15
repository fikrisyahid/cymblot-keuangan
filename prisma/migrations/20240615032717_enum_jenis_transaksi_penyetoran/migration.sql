/*
  Warnings:

  - The values [PENYIMPANAN] on the enum `JENIS_TRANSAKSI` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JENIS_TRANSAKSI_new" AS ENUM ('PEMASUKAN', 'PENGELUARAN', 'PENARIKAN', 'PENYETORAN');
ALTER TABLE "Transaksi" ALTER COLUMN "jenis" TYPE "JENIS_TRANSAKSI_new" USING ("jenis"::text::"JENIS_TRANSAKSI_new");
ALTER TYPE "JENIS_TRANSAKSI" RENAME TO "JENIS_TRANSAKSI_old";
ALTER TYPE "JENIS_TRANSAKSI_new" RENAME TO "JENIS_TRANSAKSI";
DROP TYPE "JENIS_TRANSAKSI_old";
COMMIT;
