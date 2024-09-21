export default function convertTransactionType(type: string) {
  if (type === 'PEMASUKAN') {
    return 'DEPOSIT';
  }
  if (type === 'PENGELUARAN') {
    return 'WITHDRAW';
  }
  if (type === 'TRANSFER') {
    return 'TRANSFER';
  }
  return null;
}
