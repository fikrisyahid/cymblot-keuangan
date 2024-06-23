import { IFilterDetailTable, ITableData } from "../types";

export default function getBalanceFiltered({
  filteredData,
}: {
  filter: IFilterDetailTable;
  filteredData: ITableData[];
}) {
  const totalSaldoBank = filteredData.reduce((acc, cur) => {
    if (cur.jenis === "PEMASUKAN" || cur.jenis === "PENYETORAN") {
      return acc + cur.nominal;
    }
    if (cur.jenis === "PENGELUARAN" || cur.jenis === "PENARIKAN") {
      return acc - cur.nominal;
    }
    return acc;
  }, 0);
  return totalSaldoBank;
}
