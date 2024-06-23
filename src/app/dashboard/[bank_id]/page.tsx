import prisma from "@/app/db/init";
import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { ITransaksi } from "@/types/db";
import { Badge, Button, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";
import TableSection from "./c-table-section";

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

function mapTransactionsToTableData(transaksiUser: ITransaksi[]) {
  return transaksiUser.map((transaksi, index) => ({
    id: transaksi.id,
    no: index + 1,
    tanggal: transaksi.tanggal,
    keterangan: transaksi.keterangan,
    jenis: transaksi.jenis,
    sumber: transaksi.sumber?.nama || "-",
    tujuan: transaksi.tujuan?.nama || "-",
    nominal: transaksi.nominal,
    bank: transaksi.bank ? transaksi.bankName?.nama || "-" : "Cash",
  }));
}

async function getUserTransactions({
  email,
  bankNameId,
}: {
  email: string;
  bankNameId: string;
}) {
  const [transaksiUser, daftarSumber, daftarTujuan, daftarBank] =
    await Promise.all([
      prisma.transaksi.findMany({
        where: { email, bankNameId },
        include: { sumber: true, tujuan: true, bankName: true },
        orderBy: { tanggal: "desc" },
      }),
      prisma.sumber.findMany({
        where: { email },
        orderBy: { createdAt: "asc" },
      }),
      prisma.tujuan.findMany({
        where: { email },
        orderBy: { createdAt: "asc" },
      }),
      prisma.banks.findMany({
        where: { email },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  return { transaksiUser, daftarSumber, daftarTujuan, daftarBank };
}

export default async function Page({
  params,
}: {
  params: { bank_id: string };
}) {
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

  const { transaksiUser, daftarBank, daftarSumber, daftarTujuan } =
    await getUserTransactions({
      email: bankOwnerEmail,
      bankNameId: bank_id,
    });

  const dataForTable = mapTransactionsToTableData(transaksiUser);
  const oldestDate = dayjs(
    transaksiUser[transaksiUser.length - 1]?.tanggal || new Date()
  )
    .startOf("day")
    .toDate();

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
          Detail keuangan bank
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
      <TableSection
        data={dataForTable}
        daftarSumber={daftarSumber}
        daftarTujuan={daftarTujuan}
        daftarBank={daftarBank}
        oldestDate={oldestDate}
      />
    </MainCard>
  );
}
