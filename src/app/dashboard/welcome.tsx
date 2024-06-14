import { User } from "@clerk/nextjs/server";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { TEXT_COLOR } from "@/config";
import MainCard from "../../components/main-card";
import {
  IconBuildingBank,
  IconCash,
  IconCoins,
  IconInfoCircle,
} from "@tabler/icons-react";
import stringToRupiah from "@/utils/string-to-rupiah";
import DataCard from "@/components/data-card";
import Link from "next/link";
import { ITransaksi } from "@/types/db";

export default async function Welcome({
  user,
  transaksiUser,
}: {
  user: User;
  transaksiUser: ITransaksi[];
}) {
  const totalSaldo = transaksiUser.reduce(
    (acc, cur) =>
      acc + (cur.jenis === "PEMASUKAN" ? cur.nominal : -cur.nominal),
    0
  );

  const totalSaldoBank = transaksiUser
    .filter((item) => item.bank)
    .reduce(
      (acc, cur) =>
        acc + (cur.jenis === "PEMASUKAN" ? cur.nominal : -cur.nominal),
      0
    );

  const totalSaldoCash = transaksiUser
    .filter((item) => !item.bank)
    .reduce(
      (acc, cur) =>
        acc + (cur.jenis === "PEMASUKAN" ? cur.nominal : -cur.nominal),
      0
    );

  return (
    <>
      <Title style={{ color: TEXT_COLOR }}>Halo, {user?.fullName}</Title>
      <MainCard transparent row noPadding>
        <DataCard
          backgroundColor="#38598b"
          title="Total saldo"
          text={stringToRupiah(totalSaldo.toString())}
          styleText={{
            color: totalSaldo < 0 ? "red" : "white",
          }}
        >
          <IconCoins style={{ height: "100%", width: "20%" }} />
        </DataCard>
        <DataCard
          backgroundColor="#5177b0"
          title="Bank"
          text={stringToRupiah(totalSaldoBank.toString())}
          styleText={{
            color: totalSaldoBank < 0 ? "red" : "white",
          }}
        >
          <IconBuildingBank style={{ height: "100%", width: "20%" }} />
        </DataCard>
        <DataCard
          backgroundColor="#72aad4"
          title="Cash"
          text={stringToRupiah(totalSaldoCash.toString())}
          styleText={{
            color: totalSaldoCash < 0 ? "red" : "white",
          }}
        >
          <IconCash style={{ height: "100%", width: "20%" }} />
        </DataCard>
      </MainCard>
      {transaksiUser.length === 0 && (
        <Alert
          variant="filled"
          color="blue"
          title="Alert title"
          icon={<IconInfoCircle />}
        >
          <Stack gap="sm" align="flex-start">
            <Text>
              Kamu belum memiliki data keuangan. Silahkan buat data keuangan
              terlebih dahulu
            </Text>
            <Button color="teal" component={Link} href="/detail/tambah">
              Buat data keuangan
            </Button>
          </Stack>
        </Alert>
      )}
    </>
  );
}
