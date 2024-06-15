import prisma from "@/app/db/init";
import MainCard from "@/components/main-card";
import { TEXT_COLOR } from "@/config";
import { currentUser } from "@clerk/nextjs/server";
import { Title } from "@mantine/core";
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
      <Title c={TEXT_COLOR} style={{ textAlign: "center" }}>
        Daftar Bank
      </Title>
      <MainCard noPadding transparent fullWidth>
        <Section userBanks={userBanks} />
      </MainCard>
    </MainCard>
  );
}
