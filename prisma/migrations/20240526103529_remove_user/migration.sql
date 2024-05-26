/*
  Warnings:

  - You are about to drop the column `userId` on the `Sumber` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tujuan` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Sumber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Transaksi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Tujuan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Sumber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Tujuan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sumber" DROP CONSTRAINT "Sumber_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaksi" DROP CONSTRAINT "Transaksi_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tujuan" DROP CONSTRAINT "Tujuan_userId_fkey";

-- AlterTable
ALTER TABLE "Sumber" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaksi" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tujuan" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE UNIQUE INDEX "Sumber_email_key" ON "Sumber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_email_key" ON "Transaksi"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tujuan_email_key" ON "Tujuan"("email");
