import MainCard from "@/components/main-card";
import Welcome, { WelcomeSkeleton } from "./welcome";
import { Suspense } from "react";
import MonthlyCostGraph from "./monthly-cost-graph";
import { Stack, Text } from "@mantine/core";
import { TEXT_COLOR } from "@/config";
import MonthlyIncomeGraph from "./monthly-income-graph";
import { User, currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";

export default async function Page() {
  const user = await currentUser();

  const transaksiUser = await prisma.transaksi.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  return (
    <Stack>
      <MainCard>
        <Suspense fallback={<WelcomeSkeleton />}>
          <Welcome user={user as User} transaksiUser={transaksiUser} />
        </Suspense>
      </MainCard>
      <MainCard transparent noPadding row>
        <MainCard fullWidth>
          <Text
            fw={700}
            size="xl"
            c={TEXT_COLOR}
            style={{
              textAlign: "center",
            }}
          >
            Pemasukan Bulan Ini
          </Text>
          <MonthlyCostGraph />
        </MainCard>
        <MainCard fullWidth>
          <Text
            fw={700}
            size="xl"
            c={TEXT_COLOR}
            style={{
              textAlign: "center",
            }}
          >
            Pengeluaran Bulan Ini
          </Text>
          <MonthlyIncomeGraph />
        </MainCard>
      </MainCard>
    </Stack>
  );
}
