/*
  Warnings:

  - You are about to drop the `Banks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaksi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tujuan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('DEPOSIT', 'WITHDRAW', 'TRANSFER');

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_bankNameId_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_sumberId_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_tujuanId_fkey";

-- DropTable
DROP TABLE "Banks";

-- DropTable
DROP TABLE "Sumber";

-- DropTable
DROP TABLE "Transaksi";

-- DropTable
DROP TABLE "Tujuan";

-- DropEnum
DROP TYPE "JENIS_TRANSAKSI";

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "information" TEXT NOT NULL DEFAULT '',
    "type" "TRANSACTION_TYPE" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
