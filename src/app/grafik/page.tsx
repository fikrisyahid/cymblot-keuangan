import MainCard from "@/components/main-card";
import { MONITORED_EMAIL, TEXT_COLOR } from "@/config";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
import prisma from "../db/init";
import MainBarChart from "./c-barchart";
import dayjs from "dayjs";
import isAdmin from "@/utils/is-admin";

async function getUserTransactions(email: string) {
  const loggedInAsAdmin = isAdmin(email);
  const where = loggedInAsAdmin
    ? { OR: [{ email: { in: MONITORED_EMAIL } }, { email }] }
    : { email };
  const [transaksiUser, daftarSumber, daftarTujuan] = await Promise.all([
    prisma.transaksi.findMany({
      where,
      include: { sumber: true, tujuan: true, bankName: true },
      orderBy: { tanggal: "desc" },
    }),
    prisma.sumber.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.tujuan.findMany({ where, orderBy: { createdAt: "asc" } }),
  ]);

  return { transaksiUser, daftarSumber, daftarTujuan };
}

export default async function Page() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return <div>Anda belum login</div>;
  }

  const { transaksiUser, daftarSumber, daftarTujuan } =
    await getUserTransactions(email);

  const oldestDate = dayjs(
    transaksiUser[transaksiUser.length - 1]?.tanggal || new Date()
  )
    .startOf("day")
    .toDate();

  return (
    <MainCard>
      <Title
        mb="md"
        style={{ color: TEXT_COLOR, textAlign: "center", alignSelf: "center" }}
      >
        Visualisasi Data Keuangan
      </Title>
      <MainBarChart
        data={transaksiUser}
        oldestDate={oldestDate}
        daftarSumber={daftarSumber}
        daftarTujuan={daftarTujuan}
      />
    </MainCard>
  );
}
