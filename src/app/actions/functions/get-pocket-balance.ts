'use server'

import prisma from '@/utils/db';

export default async function getPocketBalance({ id }: { id: string }) {
  const [
    balanceDeposit,
    balanceWithdraw,
    balanceFromTransfer,
    balanceTransfered,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        pocketId: id,
        type: 'DEPOSIT',
      },
      _sum: {
        value: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        pocketId: id,
        type: 'WITHDRAW',
      },
      _sum: {
        value: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        pocketDestinationId: id,
      },
      _sum: {
        value: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        pocketSourceId: id,
      },
      _sum: {
        value: true,
      },
    }),
  ]);
  const totalBalance =
    (balanceDeposit._sum.value || 0) -
    (balanceWithdraw._sum.value || 0) +
    (balanceFromTransfer._sum.value || 0) -
    (balanceTransfered._sum.value || 0);

  return totalBalance;
}
