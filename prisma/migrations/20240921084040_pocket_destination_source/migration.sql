-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "pocketDestinationId" TEXT,
ADD COLUMN     "pocketSourceId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_pocketSourceId_fkey" FOREIGN KEY ("pocketSourceId") REFERENCES "Pocket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_pocketDestinationId_fkey" FOREIGN KEY ("pocketDestinationId") REFERENCES "Pocket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
