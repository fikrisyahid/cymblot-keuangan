import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { Button, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
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
      }
    }),
    prisma.tujuan.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: "asc",
      }
    }),
  ]);

  return (
    <MainCard>
      <MainCard
        transparent
        noPadding
        row
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Button
          component={Link}
          href="/detail"
          leftSection={<IconArrowLeft />}
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
        >
          Kembali
        </Button>
        <Title style={{ color: TEXT_COLOR, textAlign: "center" }}>
          Daftar Sumber dan Tujuan
        </Title>
      </MainCard>
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
