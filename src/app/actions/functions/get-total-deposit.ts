import { Transaction } from '@prisma/client';

export default function getTotalDeposit({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const depositTransactions = transactions
    .filter((transaction) => transaction.type === 'DEPOSIT')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return depositTransactions;
}
