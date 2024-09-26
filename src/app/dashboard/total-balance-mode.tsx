'use client';

import { Select } from '@mantine/core';
import { useRouter } from 'next-nprogress-bar';
import revalidateAllRoute from '../actions/revalidate';

export default function TotalBalanceModeSwitch({
  categoryMode = 'month',
  totalBalanceMode = 'month',
}: {
  categoryMode: 'day' | 'week' | 'month' | 'year';
  totalBalanceMode: 'day' | 'week' | 'month' | 'year';
}) {
  const router = useRouter();

  return (
    <Select
      label="Periode Total Pemasukan dan Pengeluaran"
      defaultValue={totalBalanceMode}
      onChange={(value) => {
        revalidateAllRoute();
        router.push(
          `/dashboard?category_mode=${categoryMode}&total_balance_mode=${value}`,
        );
      }}
      data={[
        { value: 'day', label: 'Hari ini' },
        { value: 'week', label: 'Minggu ini' },
        { value: 'month', label: 'Bulan ini' },
        { value: 'year', label: 'Tahun ini' },
      ]}
    />
  );
}
