'use client';

import { BarChart } from '@mantine/charts';
import { Alert, Button, Select, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next-nprogress-bar';
import Link from 'next/link';

export default function CategoryDepositWithdraw({
  categoryMode,
  categoriesWithDepositAndWithdraw,
}: {
  categoryMode: 'day' | 'week' | 'month' | 'year';
  categoriesWithDepositAndWithdraw: any[];
}) {
  const router = useRouter();

  if (categoriesWithDepositAndWithdraw.length === 0) {
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
            Anda belum memiliki kategori. Silakan tambahkan kategori terlebih
            dahulu
          </Text>
          <Button component={Link} href="/category" color="teal">
            Tambah Kategori
          </Button>
        </Stack>
      </Alert>
    );
  }
  return (
    <Stack className="h-96 sm:h-full">
      <Select
        data={[
          { value: 'day', label: 'Hari ini' },
          { value: 'week', label: 'Minggu ini' },
          { value: 'month', label: 'Bulan ini' },
          { value: 'year', label: 'Tahun ini' },
        ]}
        defaultValue={categoryMode}
        onChange={(value) => {
          router.push(`/dashboard?category_mode=${value}`);
        }}
      />
      <BarChart
        className="h-full p-4 sm:p-2"
        orientation="vertical"
        data={categoriesWithDepositAndWithdraw.map((category) => ({
          category: category.name,
          Pemasukan: category.deposit,
          Pengeluaran: category.withdraw,
        }))}
        dataKey="category"
        series={[
          { name: 'Pemasukan', color: 'teal.6' },
          { name: 'Pengeluaran', color: 'violet.6' },
        ]}
        tickLine="y"
        gridAxis="y"
      />
    </Stack>
  );
}
