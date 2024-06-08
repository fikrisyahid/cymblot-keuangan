import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { Button, Flex, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
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
        <Flex direction="column" gap="sm" w="100%" align="center">
          <Text fw={700}>Daftar Sumber</Text>
          <div>Daftar sumber page</div>
          <div>Daftar sumber page</div>
          <div>Daftar sumber page</div>
        </Flex>
        <Flex direction="column" gap="sm" w="100%" align="center">
          <Text fw={700}>Daftar Tujuan</Text>
          <div>Daftar tujuan page</div>
          <div>Daftar tujuan page</div>
          <div>Daftar tujuan page</div>
        </Flex>
      </MainCard>
    </MainCard>
  );
}
