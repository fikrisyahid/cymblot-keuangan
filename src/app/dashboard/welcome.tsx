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
import {
  getBalanceBank,
  getBalanceBankDetail,
  getBalanceCash,
} from "@/utils/get-balance";
import ListBankBalance from "@/components/list-bank-balance";
import isAdmin from "@/utils/is-admin";
import ListBankBalanceAdmin from "@/components/list-bank-balance-admin";
import {
  getBalanceBankAdmin,
  getBalanceBankDetailAdmin,
} from "@/utils/get-balance-admin";

export default async function Welcome({
  fullName,
  email,
  transaksiUser,
  daftarBank,
}: {
  fullName: string;
  email: string;
  transaksiUser: ITransaksi[];
  daftarBank: IBanks[];
}) {
  const loggedInAsAdmin = isAdmin(email);

  const totalSaldoBank = loggedInAsAdmin
    ? await getBalanceBankAdmin({ email })
    : getBalanceBank(transaksiUser);
  const totalSaldoCash = getBalanceCash(transaksiUser);
  const totalSaldo = totalSaldoBank + totalSaldoCash;

  const totalSaldoBankDetail = loggedInAsAdmin
    ? await getBalanceBankDetailAdmin({
        email,
        daftarBank,
      })
    : getBalanceBankDetail({
        daftarBank,
        transaksiUser,
      });

  return (
    <>
      <Title style={{ color: TEXT_COLOR }}>Halo, {fullName}</Title>
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
          title={`Bank ${loggedInAsAdmin ? "Total" : ""}`}
          text={stringToRupiah(totalSaldoBank.toString())}
          styleText={{
            color: totalSaldoBank < 0 ? "red" : "white",
          }}
        >
          <IconBuildingBank style={{ height: "100%", width: "20%" }} />
        </DataCard>
        <DataCard
          backgroundColor="#72aad4"
          title={`Cash ${loggedInAsAdmin ? "Pribadi" : ""}`}
          text={stringToRupiah(totalSaldoCash.toString())}
          styleText={{
            color: totalSaldoCash < 0 ? "red" : "white",
          }}
        >
          <IconCash style={{ height: "100%", width: "20%" }} />
        </DataCard>
      </MainCard>
      {loggedInAsAdmin ? (
        <ListBankBalanceAdmin totalSaldoBankDetail={totalSaldoBankDetail} />
      ) : (
        <ListBankBalance totalSaldoBankDetail={totalSaldoBankDetail} />
      )}
      {transaksiUser.length === 0 && (
        <Alert
          variant="filled"
          color="blue"
          title="Info"
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
