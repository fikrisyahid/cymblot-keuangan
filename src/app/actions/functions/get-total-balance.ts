import { Transaction } from '@prisma/client';

export default function getTotalBalance({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const depositTransactions = transactions
    .filter((transaction) => transaction.type === 'DEPOSIT')
    .reduce((sum, transaction) => sum + transaction.value, 0);
  const withdrawTransactions = transactions
    .filter((transaction) => transaction.type === 'WITHDRAW')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const totalBalance = depositTransactions - withdrawTransactions;
  return totalBalance;
}
