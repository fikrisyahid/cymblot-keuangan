import { IFilterDetailTable, ITableData } from "../types";

export default function getBalanceFiltered({
  filter,
  filteredData,
}: {
  filter: IFilterDetailTable;
  filteredData: ITableData[];
}) {
  const isSearchingTotalBalance =
    filter.bank.length === 0 ||
    (filter.bank.includes("Cash") && filter.bank.length > 1);
  const isSearchingBankBalance =
    !filter.bank.includes("Cash") && filter.bank.length > 0;
  const isSearchingCashBalance =
    filter.bank.includes("Cash") && filter.bank.length === 1;

  const totalSaldoBank = filteredData.reduce((acc, cur) => {
    if (isSearchingTotalBalance) {
      if (cur.jenis === "PEMASUKAN") {
        return acc + cur.nominal;
      }
      if (cur.jenis === "PENGELUARAN") {
        return acc - cur.nominal;
      }
    }
    if (isSearchingBankBalance) {
      if (cur.jenis === "PEMASUKAN" || cur.jenis === "PENYETORAN") {
        return acc + cur.nominal;
      }
      if (cur.jenis === "PENGELUARAN" || cur.jenis === "PENARIKAN") {
        return acc - cur.nominal;
      }
    }
    if (isSearchingCashBalance) {
      if (cur.bank === "Cash") {
        if (cur.jenis === "PEMASUKAN") {
          return acc + cur.nominal;
        }
        if (cur.jenis === "PENGELUARAN") {
          return acc - cur.nominal;
        }
      }
    }
    return acc;
  }, 0);
  return totalSaldoBank;
}
