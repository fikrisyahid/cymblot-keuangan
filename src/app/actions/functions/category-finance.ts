import { Transaction } from '@prisma/client';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

function getCategoryDepositBalance({
  id,
  transactions,
  categoryMode,
}: {
  id: string;
  transactions: Transaction[];
  categoryMode: 'day' | 'week' | 'month' | 'year';
}) {
  dayjs.locale('id');
  const startDate =
    categoryMode === 'day'
      ? dayjs().startOf('day')
      : categoryMode === 'week'
      ? dayjs().startOf('week')
      : categoryMode === 'month'
      ? dayjs().startOf('month')
      : dayjs().startOf('year');

  const endDate =
    categoryMode === 'day'
      ? dayjs().endOf('day')
      : categoryMode === 'week'
      ? dayjs().endOf('week')
      : categoryMode === 'month'
      ? dayjs().endOf('month')
      : dayjs().endOf('year');

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
  categoryMode,
}: {
  id: string;
  transactions: Transaction[];
  categoryMode: 'day' | 'week' | 'month' | 'year';
}) {
  const startDate =
    categoryMode === 'day'
      ? dayjs().startOf('day')
      : categoryMode === 'week'
      ? dayjs().startOf('week')
      : categoryMode === 'month'
      ? dayjs().startOf('month')
      : dayjs().startOf('year');

  const endDate =
    categoryMode === 'day'
      ? dayjs().endOf('day')
      : categoryMode === 'week'
      ? dayjs().endOf('week')
      : categoryMode === 'month'
      ? dayjs().endOf('month')
      : dayjs().endOf('year');

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
