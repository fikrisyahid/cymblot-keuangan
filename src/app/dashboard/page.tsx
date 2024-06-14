import MainCard from "@/components/main-card";
import Welcome from "./welcome";
import MonthlyCostGraph from "./monthly-cost-graph";
import { Stack } from "@mantine/core";
import MonthlyIncomeGraph from "./monthly-income-graph";
import { User, currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";

export default async function Page() {
  const user = await currentUser();

  const transaksiUser = await prisma.transaksi.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
    include: {
      sumber: true,
      tujuan: true,
    },
  });

  return (
    <Stack>
      <MainCard>
        <Welcome user={user as User} transaksiUser={transaksiUser} />
      </MainCard>
      <MainCard transparent noPadding row>
        <MainCard fullWidth>
          <MonthlyCostGraph transaksiUser={transaksiUser} />
        </MainCard>
        <MainCard fullWidth>
          <MonthlyIncomeGraph transaksiUser={transaksiUser} />
        </MainCard>
      </MainCard>
    </Stack>
  );
}
