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
import { Pocket } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';

export default function BalancePerPocket({
  pocketsWithBalance,
}: {
  pocketsWithBalance: (Pocket & { balance: number })[];
}) {
  const allPocketsDoesNotHaveBalance = pocketsWithBalance.every(
    (pocket) => pocket.balance === 0,
  );
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
      {!allPocketsDoesNotHaveBalance && (
        <PieChart
          size={250}
          className="self-center"
          withLabelsLine
          withTooltip
          labelsPosition="outside"
          labelsType="percent"
          tooltipDataSource="segment"
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
      )}
      <Grid justify="center" align="stretch">
        {pocketsWithBalance.map((pocket) => (
          <GridCol key={pocket.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card
              shadow="sm"
              padding="sm"
              radius="md"
              withBorder
              className="flex flex-col justify-between"
              style={{
                backgroundColor: '#5177b0',
              }}
            >
              <Text fw={700} c="white">
                {pocket.name}
              </Text>
              <Text c="white">
                <NumberFormatter
                  value={pocket.balance}
                  thousandSeparator
                  prefix="Rp "
                />
              </Text>
            </Card>
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}
