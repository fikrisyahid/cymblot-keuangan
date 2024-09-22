import { Transaction } from '@prisma/client';

export default function getPocketBalance({
  id,
  transactions,
}: {
  id: string;
  transactions: Transaction[];
}) {
  const pocketTransactions = transactions.filter(
    (transaction) =>
      transaction.pocketDestinationId === id ||
      transaction.pocketSourceId === id ||
      transaction.pocketId === id,
  );

  const balanceDeposit = pocketTransactions
    .filter((transaction) => transaction.type === 'DEPOSIT')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceWithdraw = pocketTransactions
    .filter((transaction) => transaction.type === 'WITHDRAW')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceReceived = pocketTransactions
    .filter(
      (transaction) =>
        transaction.type === 'TRANSFER' &&
        transaction.pocketDestinationId === id,
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceTransfered = pocketTransactions
    .filter(
      (transaction) =>
        transaction.type === 'TRANSFER' && transaction.pocketSourceId === id,
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const totalBalance =
    balanceDeposit - balanceWithdraw + balanceReceived - balanceTransfered;

  return totalBalance;
}
