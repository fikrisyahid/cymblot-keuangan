import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('id');
dayjs.extend(utc);
dayjs.extend(timezone);

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function generateChartData({
  filteredTransactions,
  filter,
}: {
  filteredTransactions: any[];
  filter: any;
}) {
  if (filter.mode === 'day') {
    return Array.from({ length: 24 }, (_, i) => {
      const transactionsAtHour = filteredTransactions.filter((transaction) => {
        const transactionDate = dayjs(transaction.date);
        return (
          transactionDate.hour() === i &&
          transactionDate.date() === filter.day &&
          transactionDate.month() === filter.month &&
          transactionDate.year() === filter.year
        );
      });

      const deposit = transactionsAtHour
        .filter((transaction) => transaction.type === 'DEPOSIT')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const withdraw = transactionsAtHour
        .filter((transaction) => transaction.type === 'WITHDRAW')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const transfer = transactionsAtHour
        .filter((transaction) => transaction.type === 'TRANSFER')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      return {
        timePoint: i.toString(),
        Pemasukan: deposit,
        Pengeluaran: withdraw,
        Transfer: transfer,
      };
    });
  }
  if (filter.mode === 'month') {
    const daysInMonth = dayjs().month(filter.month).daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const transactionsAtDay = filteredTransactions.filter((transaction) => {
        const transactionDate = dayjs(transaction.date);
        return (
          transactionDate.date() === i + 1 &&
          transactionDate.month() === filter.month &&
          transactionDate.year() === filter.year
        );
      });

      const deposit = transactionsAtDay
        .filter((transaction) => transaction.type === 'DEPOSIT')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const withdraw = transactionsAtDay
        .filter((transaction) => transaction.type === 'WITHDRAW')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const transfer = transactionsAtDay
        .filter((transaction) => transaction.type === 'TRANSFER')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      return {
        timePoint: (i + 1).toString(),
        Pemasukan: deposit,
        Pengeluaran: withdraw,
        Transfer: transfer,
      };
    });
  }
  if (filter.mode === 'year') {
    return months.map((month, index) => {
      const transactionsAtMonth = filteredTransactions.filter((transaction) => {
        const transactionDate = dayjs(transaction.date);
        return (
          transactionDate.month() === index &&
          transactionDate.year() === filter.year
        );
      });

      const deposit = transactionsAtMonth
        .filter((transaction) => transaction.type === 'DEPOSIT')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const withdraw = transactionsAtMonth
        .filter((transaction) => transaction.type === 'WITHDRAW')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      const transfer = transactionsAtMonth
        .filter((transaction) => transaction.type === 'TRANSFER')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      return {
        timePoint: month,
        Pemasukan: deposit,
        Pengeluaran: withdraw,
        Transfer: transfer,
      };
    });
  }
  // If the mode is date range
  const startDate = dayjs(filter.minDate);
  const endDate = dayjs(filter.maxDate);
  const dateRange = Array.from(
    { length: endDate.diff(startDate, 'day') + 1 },
    (_, i) => startDate.add(i, 'day'),
  );

  return dateRange.map((date) => {
    const transactionsAtDate = filteredTransactions.filter((transaction) => {
      const transactionDate = dayjs(transaction.date);
      return transactionDate.isSame(date, 'day');
    });

    const deposit = transactionsAtDate
      .filter((transaction) => transaction.type === 'DEPOSIT')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    const withdraw = transactionsAtDate
      .filter((transaction) => transaction.type === 'WITHDRAW')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    const transfer = transactionsAtDate
      .filter((transaction) => transaction.type === 'TRANSFER')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    return {
      timePoint: date.format('DD-MM-YYYY'),
      Pemasukan: deposit,
      Pengeluaran: withdraw,
      Transfer: transfer,
    };
  });
}

export { generateChartData };
