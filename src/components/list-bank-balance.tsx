import { IBanks, ITransaksi } from "@/types/db";
import MainCard from "./main-card";
import { Badge, Stack, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";

export default function ListBankBalance({
  transaksiUser,
  daftarBank,
}: {
  transaksiUser: ITransaksi[];
  daftarBank: IBanks[];
}) {
  const totalSaldoBankDetail: any = {};
  daftarBank.forEach((item) => {
    const saldoBankAdd = transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bankName?.id === item.id &&
          transaksi.bank &&
          (transaksi.jenis === "PEMASUKAN" || transaksi.jenis === "PENYETORAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0);
    const saldoBankSubtract = transaksiUser
      .filter(
        (transaksi) =>
          transaksi.bankName?.id === item.id &&
          transaksi.bank &&
          (transaksi.jenis === "PENGELUARAN" || transaksi.jenis === "PENARIKAN")
      )
      .reduce((acc, cur) => acc + cur.nominal, 0);
    totalSaldoBankDetail[item.nama] = saldoBankAdd - saldoBankSubtract;
  });

  return (
    <MainCard transparent noPadding>
      {daftarBank.map((item) => (
        <Stack key={item.id} gap={0}>
          <Text>Saldo Bank {item.nama}</Text>
          <Badge color={totalSaldoBankDetail[item.nama] > 0 ? "teal" : "red"}>
            {stringToRupiah(totalSaldoBankDetail[item.nama].toString())}
          </Badge>
        </Stack>
      ))}
    </MainCard>
  );
}
