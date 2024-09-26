import { Transaction } from '@prisma/client';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('id');
dayjs.extend(utc);
dayjs.extend(timezone);

export default function getCategoryBalance({
  id,
  transactions,
  categoryMode,
  type,
}: {
  id: string;
  transactions: Transaction[];
  categoryMode: 'day' | 'week' | 'month' | 'year';
  type: 'DEPOSIT' | 'WITHDRAW';
}) {
  const startDate =
    categoryMode === 'day'
      ? dayjs().tz('Asia/Jakarta').startOf('day')
      : categoryMode === 'week'
      ? dayjs().tz('Asia/Jakarta').startOf('week')
      : categoryMode === 'month'
      ? dayjs().tz('Asia/Jakarta').startOf('month')
      : dayjs().tz('Asia/Jakarta').startOf('year');

  const endDate =
    categoryMode === 'day'
      ? dayjs().tz('Asia/Jakarta').endOf('day')
      : categoryMode === 'week'
      ? dayjs().tz('Asia/Jakarta').endOf('week')
      : categoryMode === 'month'
      ? dayjs().tz('Asia/Jakarta').endOf('month')
      : dayjs().tz('Asia/Jakarta').endOf('year');

  const balance = transactions
    .filter(
      (transaction) =>
        transaction.categoryId === id &&
        transaction.type === type &&
        dayjs(transaction.date).tz('Asia/Jakarta').isAfter(startDate) &&
        dayjs(transaction.date).tz('Asia/Jakarta').isBefore(endDate),
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return balance;
}
