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
  mode: 'day' | 'week' | 'month' | 'year' | 'all';
  type: 'DEPOSIT' | 'WITHDRAW';
}) {
  if (mode !== 'all') {
    const startDate = dayjs().tz('Asia/Jakarta').startOf(mode);
    const endDate = dayjs().tz('Asia/Jakarta').endOf(mode)
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
  const balance = transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return balance;
}
