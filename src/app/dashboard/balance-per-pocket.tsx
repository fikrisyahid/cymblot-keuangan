import generateSoftColor from '@/utils/generate-soft-color';
import { PieChart } from '@mantine/charts';
import {
  Alert,
  Button,
  Card,
  Grid,
  GridCol,
  NumberFormatter,
  Stack,
  Text,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';

export default function BalancePerPocket({
  pocketsWithBalance,
}: {
  pocketsWithBalance: any[];
}) {
  if (pocketsWithBalance.length === 0) {
    return (
      <Alert
        variant="filled"
        color="indigo"
        title="Info"
        icon={<IconInfoCircle />}
        p="xs"
        w="100%"
      >
        <Stack align="start">
          <Text c="white">
            Anda belum memiliki kantong. Silakan tambahkan kantong terlebih
            dahulu
          </Text>
          <Button component={Link} href="/pocket" color="teal">
            Tambah Kantong
          </Button>
        </Stack>
      </Alert>
    );
  }
  return (
    <Stack>
      <PieChart
        size={250}
        className="self-center"
        withLabelsLine
        withTooltip
        labelsPosition="outside"
        labelsType="percent"
        withLabels
        data={pocketsWithBalance.map((pocket, index) => ({
          name: pocket.name,
          value: pocket.balance,
          color: generateSoftColor({
            index,
            total: pocketsWithBalance.length,
          }),
        }))}
      />
      <Grid justify="center" align="stretch">
        {pocketsWithBalance.map((pocket) => (
          <GridCol key={pocket.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card
              shadow="sm"
              padding="sm"
              radius="md"
              withBorder
              className="flex flex-col justify-between"
            >
              <Text>{pocket.name}</Text>
              <NumberFormatter
                value={pocket.balance}
                thousandSeparator
                prefix="Rp "
              />
            </Card>
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}
