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
  categoryMode: 'day' | 'week' | 'month' | 'year' | 'all';
  type: 'DEPOSIT' | 'WITHDRAW';
}) {
  if (categoryMode !== 'all') {
    const startDate = dayjs().tz('Asia/Jakarta').startOf(categoryMode);
    const endDate = dayjs().tz('Asia/Jakarta').endOf(categoryMode);
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

  const balance = transactions
    .filter(
      (transaction) =>
        transaction.categoryId === id && transaction.type === type,
    )
    .reduce((sum, transaction) => sum + transaction.value, 0);

  return balance;
}
