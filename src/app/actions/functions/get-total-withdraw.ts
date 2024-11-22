import { Transaction } from '@prisma/client';

export default function getTotalWithdraw({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const withdrawTransactions = transactions
    .filter((transaction) => transaction.type === 'WITHDRAW')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return withdrawTransactions;
}
