import MainCard from "@/components/main-card";
import { TEXT_COLOR } from "@/config";
import { Text, Title } from "@mantine/core";
import { currentUser } from "@clerk/nextjs/server";
import Section from "./c-section";
import prisma from "@/app/db/init";

export default async function Page() {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    return <Text>Anda belum login</Text>;
  }

  const [daftarSumber, daftarTujuan] = await Promise.all([
    prisma.sumber.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.tujuan.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  return (
    <MainCard>
      <Title style={{ color: TEXT_COLOR, textAlign: "center" }}>
        Daftar Sumber dan Tujuan
      </Title>
      <MainCard row transparent noPadding fullWidth>
        <MainCard noPadding transparent fullWidth>
          <Section data={daftarSumber} type="sumber" />
        </MainCard>
        <MainCard noPadding transparent fullWidth>
          <Section data={daftarTujuan} type="tujuan" />
        </MainCard>
      </MainCard>
    </MainCard>
  );
}
