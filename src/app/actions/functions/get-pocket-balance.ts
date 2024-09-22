'use server';

import prisma from '@/utils/db';

export default async function getPocketBalance({ id }: { id: string }) {
  const transactions = await prisma.transaction.findMany({
    where: {
      pocketId: id,
    },
  });

  const balanceDeposit = transactions
    .filter((transaction) => transaction.type === 'DEPOSIT')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceWithdraw = transactions
    .filter((transaction) => transaction.type === 'WITHDRAW')
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceFromTransfer = transactions
    .filter((transaction) => transaction.pocketDestinationId === id)
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const balanceTransfered = transactions
    .filter((transaction) => transaction.pocketSourceId === id)
    .reduce((sum, transaction) => sum + transaction.value, 0);

  const totalBalance =
    balanceDeposit - balanceWithdraw + balanceFromTransfer - balanceTransfered;

  return totalBalance;
}
