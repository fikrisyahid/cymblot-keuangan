import { Stack, Text } from '@mantine/core';
import getSessionUsername from '@/utils/get-session-username';
import getSessionEmail from '@/utils/get-session-email';
import { Suspense } from 'react';

import MainCard from '../components/main-card';
import AccessBlocked from '../components/access-blocked';
import BalancePerPocket from './components/balance-per-pocket';
import BalancePerPocketSkeleton from './components/balance-per-pocket/skeleton';
import CategoryDepositWithdraw from './components/category-deposit-withdraw';
import CategoryDepositWithdrawSkeleton from './components/category-deposit-withdraw/skeleton';
import TotalBalanceCard from './components/total-balance';
import TotalBalanceCardSkeleton from './components/total-balance/skeleton';
import RecentTransactionTableSkeleton from './components/recent-transaction-table/skeleton';
import RecentTransactionTable from './components/recent-transaction-table';

export const metadata = {
  title: 'Dashboard',
};

export default async function Page({
  searchParams,
}: {
  searchParams: {
    category_sort: 'deposit' | 'withdraw' | 'all';
    category_mode: 'day' | 'week' | 'month' | 'year' | 'all';
    total_balance_mode: 'day' | 'week' | 'month' | 'year' | 'all';
  };
}) {
  const {
    category_sort: categorySort = 'all',
    category_mode: categoryMode = 'month',
    total_balance_mode: totalBalanceMode = 'month',
  } = searchParams;

  const username = await getSessionUsername();
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  return (
    <MainCard transparent noPadding>
      <MainCard>
        <Suspense
          fallback={
            <TotalBalanceCardSkeleton totalBalanceMode={totalBalanceMode} />
          }
        >
          <TotalBalanceCard
            email={email}
            totalBalanceMode={totalBalanceMode}
            username={username}
          />
        </Suspense>
      </MainCard>
      <MainCard row transparent noPadding>
        <MainCard width="50%">
          <Stack gap={0} className="text-center sm:text-start">
            <Text fw={700} size="xl">
              Saldo Tiap kantong
            </Text>
            <Text>
              Saldo yang terdapat pada setiap kantong yang Anda miliki
            </Text>
          </Stack>
          <Suspense fallback={<BalancePerPocketSkeleton />}>
            <BalancePerPocket email={email} />
          </Suspense>
        </MainCard>
        <MainCard width="50%">
          <Stack gap={0} className="text-center sm:text-start">
            <Text fw={700} size="xl">
              Pemasukan & Pengeluaran Tiap Kategori{' '}
              {categoryMode === 'day'
                ? 'Hari ini'
                : categoryMode === 'week'
                ? 'Minggu ini'
                : categoryMode === 'month'
                ? 'Bulan ini'
                : categoryMode === 'year'
                ? 'Tahun ini'
                : ''}
            </Text>
            <Text>
              Monitor pemasukan dan pengeluaran Anda pada setiap kategori
            </Text>
          </Stack>
          <Suspense fallback={<CategoryDepositWithdrawSkeleton />}>
            <CategoryDepositWithdraw
              categoryMode={categoryMode}
              categorySort={categorySort}
              email={email}
            />
          </Suspense>
        </MainCard>
      </MainCard>
      <MainCard>
        <Text fw={700} size="xl" className="text-center sm:text-start">
          Riwayat Transaksi Terbaru
        </Text>
        <Suspense fallback={<RecentTransactionTableSkeleton />}>
          <RecentTransactionTable email={email} />
        </Suspense>
      </MainCard>
    </MainCard>
  );
}
