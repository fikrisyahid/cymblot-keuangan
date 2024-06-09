import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { Button, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import SumberSection from "./sumber-section";
import TujuanSection from "./tujuan-section";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

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
          <SumberSection user={user} />
        </MainCard>
        <MainCard noPadding transparent fullWidth>
          <TujuanSection user={user} />
        </MainCard>
      </MainCard>
    </MainCard>
  );
}
