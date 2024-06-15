import prisma from "@/app/db/init";
import DataCard from "@/components/data-card";
import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import stringToRupiah from "@/utils/string-to-rupiah";
import { currentUser } from "@clerk/nextjs/server";
import { Button, Title } from "@mantine/core";
import { IconArrowLeft, IconBuildingBank, IconCash } from "@tabler/icons-react";
import Link from "next/link";
import PenarikanPenyetoranForm from "./form";
import { getBalanceBank, getBalanceCash } from "@/utils/get-balance";
import ListBankBalance from "@/components/list-bank-balance";

async function getPageData(email: string) {
  const [transaksiUser, daftarBank] = await Promise.all([
    prisma.transaksi.findMany({
      where: { email },
      include: {
        sumber: true,
        tujuan: true,
        bankName: true,
      },
    }),
    prisma.banks.findMany({
      where: { email },
    }),
  ]);

  return {
    transaksiUser,
    daftarBank,
  };
}

export default async function Page() {
  const user = await currentUser();

  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    return <>Anda belum login</>;
  }

  const { transaksiUser, daftarBank } = await getPageData(email);

  const totalSaldoBank = getBalanceBank(transaksiUser);
  const totalSaldoCash = getBalanceCash(transaksiUser);

  return (
    <MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Button
          leftSection={<IconArrowLeft />}
          component={Link}
          href="/detail"
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
        >
          Kembali
        </Button>
        <Title c={TEXT_COLOR} style={{ textAlign: "center" }}>
          Penarikan dan Penyetoran Uang
        </Title>
      </MainCard>
      <MainCard transparent noPadding row>
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
      <PenarikanPenyetoranForm daftarBank={daftarBank} />
    </MainCard>
  );
}
