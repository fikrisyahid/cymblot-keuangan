import { Card, MantineStyleProp, Text, Title } from "@mantine/core";

export default function SaldoCard({
  backgroundColor,
  title,
  text,
}: {
  backgroundColor: string;
  title: string;
  text: string;
}) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      style={{ width: "100%", backgroundColor, color: "white" }}
    >
      <Title>{title}</Title>
      <Text fw={500} size="lg">
        {text}
      </Text>
    </Card>
  );
}
