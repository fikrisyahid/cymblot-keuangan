import MainCard from "@/components/main-card";
import { TEXT_COLOR } from "@/config";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
import prisma from "../db/init";
import PrettyJSON from "@/components/pretty-json";
import { BarChart } from "@mantine/charts";

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

  return (
    <MainCard>
      <Title
        mb="md"
        style={{ color: TEXT_COLOR, textAlign: "center", alignSelf: "center" }}
      >
        Visualisasi Data Keuangan
      </Title>
      <BarChart
        h={400}
        data={[
          { month: "January", Smartphones: 1200, Laptops: 900, Tablets: 200 },
          { month: "February", Smartphones: 1900, Laptops: 1200, Tablets: 400 },
          { month: "March", Smartphones: 400, Laptops: 1000, Tablets: 200 },
          { month: "April", Smartphones: 1000, Laptops: 200, Tablets: 800 },
          { month: "May", Smartphones: 800, Laptops: 1400, Tablets: 1200 },
          { month: "June", Smartphones: 750, Laptops: 600, Tablets: 1000 },
        ]}
        dataKey="month"
        series={[
          { name: "Smartphones", color: "violet.6" },
          { name: "Laptops", color: "blue.6" },
          { name: "Tablets", color: "teal.6" },
        ]}
        tickLine="y"
      />
      <PrettyJSON text={transaksi} />
    </MainCard>
  );
}
