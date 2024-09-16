import prisma from '@/utils/db';

async function getTotalBalance({ email }: { email: string }) {
  const [transactionsDeposit, transactionsWithdraw] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        email,
        type: 'DEPOSIT',
      },
      _sum: {
        value: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        email,
        type: 'WITHDRAW',
      },
      _sum: {
        value: true,
      },
    }),
  ]);
  const totalBalance =
    (transactionsDeposit._sum.value || 0) -
    (transactionsWithdraw._sum.value || 0);
  return totalBalance;
}

export { getTotalBalance };
