import prisma from "@/app/db/init";
import SaldoCard from "@/app/dashboard/saldo-card";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
import { unstable_cache } from "next/cache";
import { TEXT_COLOR } from "@/config";
import MainCard from "../../components/main-card";
import { IconBuildingBank, IconCash, IconCoins } from "@tabler/icons-react";
import PrettyJSON from "@/components/pretty-json";
import stringToRupiah from "@/utils/string-to-rupiah";

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

  const totalSaldo = transaksiUser.reduce((acc, curr) => acc + curr.nominal, 0);

  const totalSaldoBank = transaksiUser
    .filter((item) => item.bank)
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalSaldoCash = transaksiUser
    .filter((item) => !item.bank)
    .reduce((acc, curr) => acc + curr.nominal, 0);


  return (
    <>
      <Title style={{ color: TEXT_COLOR }}>Halo {user?.fullName}</Title>
      <MainCard transparent row noPadding>
        <SaldoCard
          backgroundColor="#38598b"
          title="Total saldo"
          text={stringToRupiah(totalSaldo.toString())}
          styleText={{ color: totalSaldo < 0 ? "red" : "white" }}
        >
          <IconCoins style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard
          backgroundColor="#5177b0"
          title="Bank"
          text={stringToRupiah(totalSaldoBank.toString())}
          styleText={{ color: totalSaldoBank < 0 ? "red" : "white" }}
        >
          <IconBuildingBank style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard
          backgroundColor="#72aad4"
          title="Cash"
          text={stringToRupiah(totalSaldoCash.toString())}
          styleText={{ color: totalSaldoCash < 0 ? "red" : "white" }}
        >
          <IconCash style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
      </MainCard>
      <PrettyJSON text={transaksiUser} />
    </>
  );
}
