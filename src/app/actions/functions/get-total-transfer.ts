import { Transaction } from '@prisma/client';

export default function getTotalTransfer({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const transferTransactions = transactions
    .filter((transaction) => transaction.type === 'TRANSFER')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return transferTransactions;
}
