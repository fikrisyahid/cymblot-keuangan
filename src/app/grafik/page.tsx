import MainCard from "@/components/main-card";
import { TEXT_COLOR } from "@/config";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
import prisma from "../db/init";
import PrettyJSON from "@/components/pretty-json";
import BalanceBarChart from "./barchart";
import dayjs from "dayjs";

export default async function Page() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return <div>Anda belum login</div>;
  }

  const transaksi = await prisma.transaksi.findMany({
    where: {
      email,
    },
    include: {
      sumber: true,
      tujuan: true,
    },
  });

  const oldestDate = dayjs(
    transaksi[transaksi.length - 1]?.tanggal || new Date()
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
      <BalanceBarChart transaksi={transaksi} oldestDate={oldestDate} />
      <PrettyJSON text={transaksi} />
    </MainCard>
  );
}
