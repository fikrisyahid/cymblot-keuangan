import { Transaction } from '@prisma/client';
import dayjs from 'dayjs';

function getCategoryDepositBalance({
  id,
  transactions,
  mode,
}: {
  id: string;
  transactions: Transaction[];
  mode: 'today' | 'this_month' | 'this_year';
}) {
  const startDate =
    mode === 'today'
      ? dayjs().startOf('day')
      : mode === 'this_month'
      ? dayjs().startOf('month')
      : mode === 'this_year'
      ? dayjs().startOf('year')
      : dayjs().startOf('month');

  const endDate =
    mode === 'today'
      ? dayjs().endOf('day')
      : mode === 'this_month'
      ? dayjs().endOf('month')
      : mode === 'this_year'
      ? dayjs().endOf('year')
      : dayjs().startOf('month');

  const depositBalance = transactions
    .filter(
      (transaction) =>
        transaction.categoryId === id &&
        transaction.type === 'DEPOSIT' &&
        dayjs(transaction.date).isAfter(startDate) &&
        dayjs(transaction.date).isBefore(endDate),
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return depositBalance;
}

function getCategoryWithdrawBalance({
  id,
  transactions,
  mode,
}: {
  id: string;
  transactions: Transaction[];
  mode: 'today' | 'this_month' | 'this_year';
}) {
  const startDate =
    mode === 'today'
      ? dayjs().startOf('day')
      : mode === 'this_month'
      ? dayjs().startOf('month')
      : mode === 'this_year'
      ? dayjs().startOf('year')
      : dayjs().startOf('month');

  const endDate =
    mode === 'today'
      ? dayjs().endOf('day')
      : mode === 'this_month'
      ? dayjs().endOf('month')
      : mode === 'this_year'
      ? dayjs().endOf('year')
      : dayjs().startOf('month');

  const withdrawBalance = transactions
    .filter(
      (transaction) =>
        transaction.categoryId === id &&
        transaction.type === 'WITHDRAW' &&
        dayjs(transaction.date).isAfter(startDate) &&
        dayjs(transaction.date).isBefore(endDate),
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return withdrawBalance;
}

export { getCategoryDepositBalance, getCategoryWithdrawBalance };
