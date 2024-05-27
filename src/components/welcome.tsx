import prisma from "@/app/db/init";
import SaldoCard from "@/components/saldo-card";
import { currentUser } from "@clerk/nextjs/server";
import { Flex, Title } from "@mantine/core";
import { unstable_cache } from "next/cache";
import { TEXT_COLOR } from "@/config";
import MainCard from "./main-card";
import { IconBuildingBank, IconCash, IconCoins } from "@tabler/icons-react";

export default async function Welcome() {
  const user = await currentUser();

  const transaksiUserCache = unstable_cache(
    async () =>
      await prisma.transaksi.findMany({
        where: {
          email: user?.emailAddresses[0].emailAddress,
        },
      }),
    ["revalidateWelcome"]
  );

  const transaksiUser = await transaksiUserCache();

  return (
    <MainCard>
      <Title style={{ color: TEXT_COLOR }}>Halo {user?.fullName}</Title>
      <MainCard transparent row noPadding>
        <SaldoCard
          backgroundColor="#38598b"
          title="Total saldo"
          text="Rp500,000.00"
        >
          <IconCoins style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard backgroundColor="#5177b0" title="Bank" text="Rp500,000.00">
          <IconBuildingBank style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard backgroundColor="#72aad4" title="Cash" text="Rp500,000.00">
          <IconCash style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
      </MainCard>
    </MainCard>
  );
}
