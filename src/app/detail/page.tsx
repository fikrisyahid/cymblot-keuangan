import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import TableSection from "./c-table-section";
import MainCard from "@/components/main-card";
import { Title } from "@mantine/core";
import { TEXT_COLOR } from "@/config";
import dayjs from "dayjs";

async function getUserTransactions(email: string) {
  const [transaksiUser, daftarSumber, daftarTujuan] = await Promise.all([
    prisma.transaksi.findMany({
      where: { email },
      include: { sumber: true, tujuan: true },
      orderBy: { tanggal: "desc" },
    }),
    prisma.sumber.findMany({ where: { email } }),
    prisma.tujuan.findMany({ where: { email } }),
  ]);

  return { transaksiUser, daftarSumber, daftarTujuan };
}

function mapTransactionsToTableData(transaksiUser: any[]) {
  return transaksiUser.map((transaksi, index) => ({
    id: transaksi.id,
    no: index + 1,
    tanggal: transaksi.tanggal,
    keterangan: transaksi.keterangan,
    jenis: transaksi.jenis,
    sumber: transaksi.sumber?.nama || "-",
    tujuan: transaksi.tujuan?.nama || "-",
    nominal: transaksi.nominal,
    bank: transaksi.bank,
  }));
}

export default async function Page() {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    return <div>User not found</div>;
  }

  const { transaksiUser, daftarSumber, daftarTujuan } =
    await getUserTransactions(email);

  const dataForTable = mapTransactionsToTableData(transaksiUser);
  const oldestDate = dayjs(
    transaksiUser[transaksiUser.length - 1]?.tanggal || new Date()
  )
    .startOf("day")
    .toDate();

  return (
    <MainCard>
      <Title style={{ color: TEXT_COLOR, alignSelf: "center" }}>
        Detail data keuangan
      </Title>
      <TableSection
        data={dataForTable}
        daftarSumber={daftarSumber}
        daftarTujuan={daftarTujuan}
        oldestDate={oldestDate}
      />
    </MainCard>
  );
}
