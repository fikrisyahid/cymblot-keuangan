import prisma from "@/app/db/init";
import SaldoCard from "@/app/dashboard/saldo-card";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
import { unstable_cache } from "next/cache";
import { TEXT_COLOR } from "@/config";
import MainCard from "../../components/main-card";
import { IconBuildingBank, IconCash, IconCoins } from "@tabler/icons-react";
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

  const totalSaldo = {
    PEMASUKAN: transaksiUser
      .filter((item) => item.jenis === "PEMASUKAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
    PENGELUARAN: transaksiUser
      .filter((item) => item.jenis === "PENGELUARAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
  };

  const totalSaldoBank = {
    PEMASUKAN: transaksiUser
      .filter((item) => item.bank && item.jenis === "PEMASUKAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
    PENGELUARAN: transaksiUser
      .filter((item) => item.bank && item.jenis === "PENGELUARAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
  };

  const totalSaldoCash = {
    PEMASUKAN: transaksiUser
      .filter((item) => !item.bank && item.jenis === "PEMASUKAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
    PENGELUARAN: transaksiUser
      .filter((item) => !item.bank && item.jenis === "PENGELUARAN")
      .reduce((acc, curr) => acc + curr.nominal, 0),
  };

  return (
    <>
      <Title style={{ color: TEXT_COLOR }}>Halo {user?.fullName}</Title>
      <MainCard transparent row noPadding>
        <SaldoCard
          backgroundColor="#38598b"
          title="Total saldo"
          text={stringToRupiah(
            (totalSaldo.PEMASUKAN - totalSaldo.PENGELUARAN).toString()
          )}
          styleText={{
            color:
              totalSaldo.PEMASUKAN - totalSaldo.PENGELUARAN < 0
                ? "red"
                : "white",
          }}
        >
          <IconCoins style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard
          backgroundColor="#5177b0"
          title="Bank"
          text={stringToRupiah(
            (totalSaldoBank.PEMASUKAN - totalSaldoBank.PENGELUARAN).toString()
          )}
          styleText={{
            color:
              totalSaldoBank.PEMASUKAN - totalSaldoBank.PENGELUARAN < 0
                ? "red"
                : "white",
          }}
        >
          <IconBuildingBank style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
        <SaldoCard
          backgroundColor="#72aad4"
          title="Cash"
          text={stringToRupiah(
            (totalSaldoCash.PEMASUKAN - totalSaldoCash.PENGELUARAN).toString()
          )}
          styleText={{
            color:
              totalSaldoCash.PEMASUKAN - totalSaldoCash.PENGELUARAN < 0
                ? "red"
                : "white",
          }}
        >
          <IconCash style={{ height: "100%", width: "20%" }} />
        </SaldoCard>
      </MainCard>
    </>
  );
}
