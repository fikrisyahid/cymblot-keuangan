'use server';

import { Transaction } from '@prisma/client';
import { getTransaction } from '../db/transaction';

export default async function getTotalBalance({ email }: { email: string }) {
  const transactions = (await getTransaction({ email })) as Transaction[];

  const depositTransactions = transactions.filter(
    (transaction) => transaction.type === 'DEPOSIT',
  );
  const withdrawTransactions = transactions.filter(
    (transaction) => transaction.type === 'WITHDRAW',
  );

  const totalDeposit = depositTransactions.reduce(
    (sum, transaction) => sum + transaction.value,
    0,
  );
  const totalWithdraw = withdrawTransactions.reduce(
    (sum, transaction) => sum + transaction.value,
    0,
  );
  const totalBalance = totalDeposit - totalWithdraw;
  return totalBalance;
}
