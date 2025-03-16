'use client';

import updateSearchParams from '@/utils/update-search-params';
import { Select } from '@mantine/core';
import { useRouter } from 'next-nprogress-bar';

export default function TotalBalanceModeSwitch({
  totalBalanceMode = 'month',
}: {
  totalBalanceMode: 'day' | 'week' | 'month' | 'year' | 'all';
}) {
  const router = useRouter();

  return (
    <Select
      allowDeselect={false}
      label="Periode Total Pemasukan dan Pengeluaran"
      defaultValue={totalBalanceMode}
      onChange={(value) =>
        updateSearchParams({
          newSearchParams: { total_balance_mode: value },
          router,
        })
      }
      data={[
        { value: 'day', label: 'Hari ini' },
        { value: 'week', label: 'Minggu ini' },
        { value: 'month', label: 'Bulan ini' },
        { value: 'year', label: 'Tahun ini' },
        { value: 'all', label: 'Semua' },
      ]}
    />
  );
}
