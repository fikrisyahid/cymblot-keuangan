import MainCard from "@/components/main-card";
import Welcome from "./welcome";
import MonthlyCostGraph from "./monthly-cost-graph";
import { Stack } from "@mantine/core";
import MonthlyIncomeGraph from "./monthly-income-graph";
import { User, currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";

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
    return (
      <div>
        <p>Kamu belum login</p>
      </div>
    );
  }

  const { transaksiUser, daftarBank } = await getPageData(email);

  return (
    <Stack>
      <MainCard>
        <Welcome
          user={user as User}
          transaksiUser={transaksiUser}
          daftarBank={daftarBank}
        />
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
