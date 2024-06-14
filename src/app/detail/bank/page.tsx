import prisma from "@/app/db/init";
import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { currentUser } from "@clerk/nextjs/server";
import { Button, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import Section from "./c-section";

export default async function Page() {
  const user = await currentUser();

  const userBanks = await prisma.banks.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  return (
    <MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Button
          leftSection={<IconArrowLeft />}
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
          component={Link}
          href="/detail"
        >
          Kembali
        </Button>
        <Title c={TEXT_COLOR} style={{ textAlign: "center" }}>
          Daftar Bank
        </Title>
      </MainCard>
      <MainCard noPadding transparent fullWidth>
        <Section userBanks={userBanks} />
      </MainCard>
    </MainCard>
  );
}
