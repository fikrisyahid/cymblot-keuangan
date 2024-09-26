import { Transaction } from '@prisma/client';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('id');
dayjs.extend(utc);
dayjs.extend(timezone);

export default function getGeneralBalance({
  transactions,
  mode,
  type,
}: {
  transactions: Transaction[];
  mode: 'day' | 'week' | 'month' | 'year';
  type: 'DEPOSIT' | 'WITHDRAW';
}) {
  const startDate =
    mode === 'day'
      ? dayjs().tz('Asia/Jakarta').startOf('day')
      : mode === 'week'
      ? dayjs().tz('Asia/Jakarta').startOf('week')
      : mode === 'month'
      ? dayjs().tz('Asia/Jakarta').startOf('month')
      : dayjs().tz('Asia/Jakarta').startOf('year');

  const endDate =
    mode === 'day'
      ? dayjs().tz('Asia/Jakarta').endOf('day')
      : mode === 'week'
      ? dayjs().tz('Asia/Jakarta').endOf('week')
      : mode === 'month'
      ? dayjs().tz('Asia/Jakarta').endOf('month')
      : dayjs().tz('Asia/Jakarta').endOf('year');

  const balance = transactions
    .filter(
      (transaction) =>
        transaction.type === type &&
        dayjs(transaction.date).tz('Asia/Jakarta').isAfter(startDate) &&
        dayjs(transaction.date).tz('Asia/Jakarta').isBefore(endDate),
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return balance;
}
