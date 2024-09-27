import { NumberFormatter, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import getSessionUsername from '@/utils/get-session-username';
import getSessionEmail from '@/utils/get-session-email';
import { Category, Pocket, Transaction } from '@prisma/client';
import {
  IconCoins,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';

import MainCard from '../components/main-card';
import getTotalBalance from '../actions/functions/get-total-balance';
import AccessBlocked from '../components/access-blocked';
import FailedState from '../components/failed-state';
import { getPocket } from '../actions/db/pocket';
import BalancePerPocket from './balance-per-pocket';
import { getTransaction } from '../actions/db/transaction';
import CategoryDepositWithdraw from './category-deposit-withdraw';
import RecentTransactionTable from './recent-transaction-table';
import { getCategory } from '../actions/db/category';
import getPocketBalance from '../actions/functions/get-pocket-balance';
import TotalBalanceModeSwitch from './total-balance-mode';
import getCategoryBalance from '../actions/functions/get-category-balance';
import getGeneralBalance from '../actions/functions/get-general-balance';

export default async function Page({
  searchParams,
}: {
  searchParams: {
    category_mode: 'day' | 'week' | 'month' | 'year' | 'all';
    total_balance_mode: 'day' | 'week' | 'month' | 'year' | 'all';
  };
}) {
  const {
    category_mode: categoryMode = 'month',
    total_balance_mode: totalBalanceMode = 'month',
  } = searchParams;
  const username = await getSessionUsername();
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const pockets = (await getPocket({ email })) as Pocket[];
  const categories = (await getCategory({ email })) as Category[];
  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
      pocketDestination: true,
      pocketSource: true,
    },
  })) as Transaction[];

  if (!pockets || !transactions || !categories) {
    return <FailedState />;
  }

  const pocketsWithBalance = pockets.map((pocket: Pocket) => ({
    ...pocket,
    balance: getPocketBalance({
      id: pocket.id,
      transactions,
    }),
  }));

  const categoriesWithDepositAndWithdraw = categories
    .map((category) => ({
      ...category,
      deposit: getCategoryBalance({
        id: category.id,
        transactions,
        categoryMode,
        type: 'DEPOSIT',
      }),
      withdraw: getCategoryBalance({
        id: category.id,
        transactions,
        categoryMode,
        type: 'WITHDRAW',
      }),
    }))
    .sort(
      (a, b) => (b.deposit + b.withdraw) / 2 - (a.deposit + a.withdraw) / 2,
    );

  const transactionsForTable = transactions
    .slice(0, 5)
    .map((transaction, index) => ({
      no: index + 1,
      ...transaction,
    }));

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
    <MainCard transparent noPadding>
      <MainCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Title className="text-center sm:text-start">Halo {username}</Title>
          <TotalBalanceModeSwitch
            categoryMode={categoryMode}
            totalBalanceMode={totalBalanceMode}
          />
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
          <BalancePerPocket pocketsWithBalance={pocketsWithBalance} />
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
              Monitor pemasukan dan pengeluaran Anda pada setiap kategori dalam
              periode waktu tertentu
            </Text>
          </Stack>
          <CategoryDepositWithdraw
            categoryMode={categoryMode}
            categoriesWithDepositAndWithdraw={categoriesWithDepositAndWithdraw}
            totalBalanceMode={totalBalanceMode}
          />
        </MainCard>
      </MainCard>
      <MainCard>
        <Text fw={700} size="xl" className="text-center sm:text-start">
          Riwayat Transaksi Terbaru
        </Text>
        <RecentTransactionTable transactions={transactionsForTable} />
      </MainCard>
    </MainCard>
  );
}
