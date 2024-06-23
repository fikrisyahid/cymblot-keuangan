import MainCard from "@/components/main-card";
import Welcome from "./welcome";
import MonthlyCostGraph from "./monthly-cost-graph";
import { Stack } from "@mantine/core";
import MonthlyIncomeGraph from "./monthly-income-graph";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import { MONITORED_EMAIL } from "@/config";
import isAdmin from "@/utils/is-admin";

async function getPageData(email: string) {
  const loggedInAsAdmin = isAdmin(email);
  const where = loggedInAsAdmin
    ? { OR: [{ email: { in: MONITORED_EMAIL } }, { email }] }
    : { email };
  const [transaksiUser, daftarBank] = await Promise.all([
    prisma.transaksi.findMany({
      where,
      include: {
        sumber: true,
        tujuan: true,
        bankName: true,
      },
    }),
    prisma.banks.findMany({ where }),
  ]);

  return {
    transaksiUser,
    daftarBank,
  };
}

export default async function Page() {
  const user = await currentUser();

  const fullName = user?.fullName || "Tamu";
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
          fullName={fullName}
          email={email}
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
