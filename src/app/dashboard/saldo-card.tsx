import { Text, Title } from "@mantine/core";
import MainCard from "../../components/main-card";

export default function SaldoCard({
  backgroundColor,
  title,
  text,
  children,
  styleText,
}: {
  backgroundColor: string;
  title: string;
  text: string;
  children: React.ReactNode;
  styleText?: React.CSSProperties;
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
        <Text fw={500} size="lg" style={styleText}>
          {text}
        </Text>
      </MainCard>
      {children}
    </MainCard>
  );
}
