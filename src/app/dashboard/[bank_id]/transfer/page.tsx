import prisma from "@/app/db/init";
import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, MONITORED_EMAIL, TEXT_COLOR } from "@/config";
import { getBalanceBank } from "@/utils/get-balance";
import isAdmin from "@/utils/is-admin";
import stringToRupiah from "@/utils/string-to-rupiah";
import { currentUser } from "@clerk/nextjs/server";
import { Badge, Button, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import TransferForm from "./form";

function NotFoundState() {
  return (
    <MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Button
          leftSection={<IconArrowLeft />}
          component={Link}
          href="/dashboard"
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
        >
          Kembali
        </Button>
        <Title c={TEXT_COLOR} style={{ textAlign: "center" }}>
          Bank tidak ditemukan
        </Title>
      </MainCard>
    </MainCard>
  );
}

async function getPageData({
  loggedInUserEmail,
  bankOwnerEmail,
  bankNameId,
}: {
  loggedInUserEmail: string;
  bankOwnerEmail: string;
  bankNameId: string;
}) {
  const [transaksiUser, daftarBank] = await Promise.all([
    prisma.transaksi.findMany({
      where: { email: bankOwnerEmail, bankNameId },
    }),
    prisma.banks.findMany({
      where: {
        OR: [{ email: { in: MONITORED_EMAIL } }, { email: loggedInUserEmail }],
      },
    }),
  ]);

  return {
    transaksiUser,
    daftarBank,
  };
}

export default async function Page({
  params,
}: {
  params: { bank_id: string };
}) {
  const user = await currentUser();
  const loggedInUserEmail = user?.emailAddresses[0].emailAddress;

  if (!loggedInUserEmail) {
    return (
      <div>
        <p>Kamu belum login</p>
      </div>
    );
  }

  if (!isAdmin(loggedInUserEmail)) {
    return (
      <div>
        <p>Halaman ini hanya bisa diakses oleh admin</p>
      </div>
    );
  }

  const { bank_id } = params;

  const bankDetail = await prisma.banks.findUnique({
    where: {
      id: bank_id,
    },
  });

  const bankOwnerEmail = bankDetail?.email;

  if (!bankOwnerEmail) {
    return <NotFoundState />;
  }

  const { transaksiUser, daftarBank } = await getPageData({
    loggedInUserEmail,
    bankOwnerEmail,
    bankNameId: bank_id,
  });
  const bankBalance = getBalanceBank(transaksiUser);
  const otherBankLists = daftarBank.filter((bank) => bank.id !== bank_id);

  return (
    <MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Button
          leftSection={<IconArrowLeft />}
          component={Link}
          href={`/dashboard/${bank_id}`}
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
        >
          Kembali
        </Button>
        <Title c={TEXT_COLOR} style={{ textAlign: "center" }}>
          Transfer bank
        </Title>
      </MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Text c={TEXT_COLOR} fw={700}>
          {bankOwnerEmail}
        </Text>
        <Badge color="teal" size="lg">
          {bankDetail?.nama}
        </Badge>
      </MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Text c={TEXT_COLOR} fw={700}>
          Total saldo
        </Text>
        <Badge color={bankBalance > 0 ? "teal" : "red"} size="lg">
          {stringToRupiah(bankBalance.toString())}
        </Badge>
      </MainCard>
      <TransferForm bankBalance={bankBalance} otherBankLists={otherBankLists} />
    </MainCard>
  );
}
