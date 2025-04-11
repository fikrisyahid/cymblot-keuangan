import MainCard from '@/app/components/main-card';
import { SimpleGrid, Skeleton, Stack, Title } from '@mantine/core';
import {
  IconCoins,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import TotalBalanceModeSwitch from '../total-balance-mode';

export default async function TotalBalanceCardSkeleton({
  totalBalanceMode,
}: {
  totalBalanceMode: 'day' | 'week' | 'month' | 'year' | 'all';
}) {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row w-full">
          <Title className="text-center sm:text-start">Halo</Title>
          <Skeleton height={40} className="w-full sm:w-96" />
        </div>
        <TotalBalanceModeSwitch totalBalanceMode={totalBalanceMode} />
      </div>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <MainCard
          style={{
            backgroundColor: '#38598b',
            justifyContent: 'space-between',
          }}
          forceRow
        >
          <Stack justify="space-between">
            <Title c="white">Total saldo</Title>
            <Skeleton height={20} />
          </Stack>
          <IconCoins color="white" size={96} className="min-h-full" />
        </MainCard>
        <MainCard
          style={{
            backgroundColor: '#4b9a41',
            justifyContent: 'space-between',
          }}
          forceRow
        >
          <Stack justify="space-between">
            <Title c="white" size={28}>
              Total Pemasukan{' '}
              {totalBalanceMode === 'day'
                ? 'Hari ini'
                : totalBalanceMode === 'week'
                ? 'Minggu ini'
                : totalBalanceMode === 'month'
                ? 'Bulan ini'
                : totalBalanceMode === 'year'
                ? 'Tahun ini'
                : ''}
            </Title>
            <Skeleton height={20} />
          </Stack>
          <IconTrendingUp color="white" size={96} className="min-h-full" />
        </MainCard>
        <MainCard
          style={{
            backgroundColor: '#ed7877',
            justifyContent: 'space-between',
          }}
          forceRow
        >
          <Stack justify="space-between">
            <Title c="white" size={28}>
              Total Pengeluaran{' '}
              {totalBalanceMode === 'day'
                ? 'Hari ini'
                : totalBalanceMode === 'week'
                ? 'Minggu ini'
                : totalBalanceMode === 'month'
                ? 'Bulan ini'
                : totalBalanceMode === 'year'
                ? 'Tahun ini'
                : ''}
            </Title>
            <Skeleton height={20} />
          </Stack>
          <IconTrendingDown color="white" size={96} className="min-h-full" />
        </MainCard>
      </SimpleGrid>
    </>
  );
}
