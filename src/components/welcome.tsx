import prisma from "@/app/db/init";
import SaldoCard from "@/components/saldo-card";
import { currentUser } from "@clerk/nextjs/server";
import { Button, Flex, Title } from "@mantine/core";
import { unstable_cache } from "next/cache";

export default async function Welcome() {
  const user = await currentUser();

  const transaksiUser = unstable_cache(
    async () =>
      await prisma.transaksi.findMany({
        where: {
          user: {
            email: user?.emailAddresses[0].emailAddress,
          },
        },
      }),
    ["revalidateWelcome"]
  );

  return (
    <>
      <Title>Halo {user?.fullName}</Title>
      <Flex gap="sm">
        <SaldoCard
          backgroundColor="#615EFC"
          title="Total saldo"
          text="Rp500,000.00"
        />
        <SaldoCard backgroundColor="#FFA62F" title="Bank" text="Rp500,000.00" />
        <SaldoCard backgroundColor="#D2649A" title="Cash" text="Rp500,000.00" />
      </Flex>
    </>
  );
}
