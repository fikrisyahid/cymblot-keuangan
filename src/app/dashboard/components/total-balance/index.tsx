import MainCard from '@/app/components/main-card';
import { NumberFormatter, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  IconCoins,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import { getTransaction } from '@/app/actions/db/transaction';
import { Category, Pocket, Transaction } from '@prisma/client';
import getTotalBalance from '@/app/actions/functions/get-total-balance';
import getGeneralBalance from '@/app/actions/functions/get-general-balance';
import TotalBalanceModeSwitch from '../total-balance-mode';

export default async function TotalBalanceCard({
  email,
  username,
  totalBalanceMode,
}: {
  email: string;
  username: string;
  totalBalanceMode: 'day' | 'week' | 'month' | 'year' | 'all';
}) {
  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
      pocketDestination: true,
      pocketSource: true,
    },
  })) as (Transaction & {
    Category: Category;
    Pocket: Pocket;
    PocketSource: Pocket;
    PocketDestination: Pocket;
  })[];
  const totalBalance = getTotalBalance({ transactions });
  const depositAndWithdrawBalance = {
    deposit: getGeneralBalance({
      transactions,
      mode: totalBalanceMode,
      type: 'DEPOSIT',
    }),
    withdraw: getGeneralBalance({
      transactions,
      mode: totalBalanceMode,
      type: 'WITHDRAW',
    }),
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Title className="text-center sm:text-start">Halo {username}</Title>
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
            <Text c="white" size="lg" fw={700}>
              <NumberFormatter
                value={totalBalance}
                prefix="Rp "
                thousandSeparator
              />
            </Text>
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
            <Text c="white" size="lg" fw={700}>
              <NumberFormatter
                value={depositAndWithdrawBalance.deposit}
                prefix="Rp "
                thousandSeparator
              />
            </Text>
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
            <Text c="white" size="lg" fw={700}>
              <NumberFormatter
                value={depositAndWithdrawBalance.withdraw}
                prefix="Rp "
                thousandSeparator
              />
            </Text>
          </Stack>
          <IconTrendingDown color="white" size={96} className="min-h-full" />
        </MainCard>
      </SimpleGrid>
    </>
  );
}
