export default function convertTransactionType(type: string) {
  if (type === 'PEMASUKAN') {
    return 'DEPOSIT';
  }
  if (type === 'PENGELUARAN') {
    return 'WITHDRAW';
  }
  if (type === 'DEPOSIT') {
    return 'PEMASUKAN';
  }
  if (type === 'WITHDRAW') {
    return 'PENGELUARAN';
  }
  if (type === 'TRANSFER') {
    return type;
  }
  return null;
}
