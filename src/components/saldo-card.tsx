import { Card, MantineStyleProp, Text, Title } from "@mantine/core";
import MainCard from "./main-card";
import { IconCoins } from "@tabler/icons-react";

export default function SaldoCard({
  backgroundColor,
  title,
  text,
  children,
}: {
  backgroundColor: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <MainCard
      width="100%"
      style={{
        backgroundColor,
        color: "white",
        justifyContent: "space-between",
      }}
      forceRow
    >
      <MainCard noPadding transparent>
        <Title>{title}</Title>
        <Text fw={500} size="lg">
          {text}
        </Text>
      </MainCard>
      {children}
    </MainCard>
  );
}
