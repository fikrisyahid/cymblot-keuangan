import { Text, Title } from "@mantine/core";
import MainCard from "./main-card";

export default function SaldoCard({
  backgroundColor,
  title,
  text,
  textColor = "white",
  children,
  width = "100%",
  styleText,
}: {
  backgroundColor: string;
  title: string;
  text: string;
  textColor?: string;
  children?: React.ReactNode;
  width?: string | number;
  styleText?: React.CSSProperties;
}) {
  return (
    <MainCard
      width={width}
      style={{
        backgroundColor,
        color: textColor,
        justifyContent: children ? "space-between" : "flex-start",
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
