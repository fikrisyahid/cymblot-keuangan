import { ITransaksi } from "@/types/db";

export function getBalanceBank(transaksiUser: ITransaksi[]) {
  const balanceBank = {
    add: transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bank &&
          (transaksi.jenis === "PEMASUKAN" || transaksi.jenis === "PENYETORAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
    subtract: transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bank &&
          (transaksi.jenis === "PENGELUARAN" || transaksi.jenis === "PENARIKAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
  };

  return balanceBank.add - balanceBank.subtract;
}

export function getBalanceCash(transaksiUser: ITransaksi[]) {
  const balanceCash = {
    add: transaksiUser
      .filter(
        (transaksi) =>
          (!transaksi.bank && transaksi.jenis === "PEMASUKAN") ||
          (transaksi.bank && transaksi.jenis === "PENARIKAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
    subtract: transaksiUser
      .filter(
        (transaksi) =>
          (!transaksi.bank && transaksi.jenis === "PENGELUARAN") ||
          (transaksi.bank && transaksi.jenis === "PENYETORAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0),
  };

  return balanceCash.add - balanceCash.subtract;
}
