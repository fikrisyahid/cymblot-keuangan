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
        deposit,
        withdraw,
        transfer,
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
        deposit,
        withdraw,
        transfer,
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
        deposit,
        withdraw,
        transfer,
      };
    });
  }
  return [
    {
      timePoint: dayjs().format('YYYY-MM-DD'),
      deposit: 0,
      withdraw: 0,
    },
  ];
}

export { generateChartData };
