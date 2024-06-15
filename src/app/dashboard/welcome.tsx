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
import { IBanks, ITransaksi } from "@/types/db";
import { getBalanceBank, getBalanceCash } from "@/utils/get-balance";
import ListBankBalance from "@/components/list-bank-balance";

export default async function Welcome({
  user,
  transaksiUser,
  daftarBank,
}: {
  user: User;
  transaksiUser: ITransaksi[];
  daftarBank: IBanks[];
}) {
  const totalSaldoBank = getBalanceBank(transaksiUser);
  const totalSaldoCash = getBalanceCash(transaksiUser);
  const totalSaldo = totalSaldoBank + totalSaldoCash;

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
      <ListBankBalance daftarBank={daftarBank} transaksiUser={transaksiUser} />
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
