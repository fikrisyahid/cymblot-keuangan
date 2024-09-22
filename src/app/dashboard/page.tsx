import { NumberFormatter, Stack, Text, Title } from '@mantine/core';
import getSessionUsername from '@/utils/get-session-username';
import getSessionEmail from '@/utils/get-session-email';
import { Category, Pocket, Transaction } from '@prisma/client';

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
import {
  getCategoryDepositBalance,
  getCategoryWithdrawBalance,
} from '../actions/functions/category-finance';

export default async function Page({
  searchParams,
}: {
  searchParams: { category_mode: 'day' | 'week' | 'month' | 'year' };
}) {
  const { category_mode: categoryMode = 'month' } = searchParams;
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

  const categoriesWithDepositAndWithdraw = categories.map((category) => ({
    ...category,
    deposit: getCategoryDepositBalance({
      id: category.id,
      transactions,
      categoryMode,
    }),
    withdraw: getCategoryWithdrawBalance({
      id: category.id,
      transactions,
      categoryMode,
    }),
  }));

  const transactionsForTable = transactions
    .slice(0, 5)
    .map((transaction, index) => ({
      no: index + 1,
      ...transaction,
    }));

  const totalBalance = getTotalBalance({ transactions });

  return (
    <Stack>
      <MainCard>
        <Title className="text-center sm:text-start">Halo {username}</Title>
        <MainCard row transparent noPadding wrap>
          <MainCard style={{ backgroundColor: '#38598b' }} fullWidth>
            <Title c="white" className="text-center sm:text-start">
              Total saldo
            </Title>
            <Text
              c={totalBalance > 0 ? 'green' : 'red'}
              size="lg"
              fw={700}
              className="text-center sm:text-start"
            >
              <NumberFormatter
                value={totalBalance}
                prefix="Rp "
                thousandSeparator
              />
            </Text>
          </MainCard>
        </MainCard>
      </MainCard>
      <MainCard row transparent noPadding>
        <MainCard width="50%">
          <Stack gap={0} className="text-center sm:text-start">
            <Text fw={700} size="xl">
              Saldo tiap kantong
            </Text>
            <Text>
              Saldo yang terdapat pada setiap kantong yang Anda miliki
            </Text>
          </Stack>
          <BalancePerPocket pocketsWithBalance={pocketsWithBalance} />
        </MainCard>
        <MainCard width="50%">
          <Text fw={700} size="xl" className="text-center sm:text-start">
            Pemasukan & Pengeluaran Kategori
          </Text>
          <CategoryDepositWithdraw
            categoryMode={categoryMode}
            categoriesWithDepositAndWithdraw={categoriesWithDepositAndWithdraw}
          />
        </MainCard>
      </MainCard>
      <MainCard>
        <Text fw={700} size="xl" className="text-center sm:text-start">
          Riwayat Transaksi Terbaru
        </Text>
        <RecentTransactionTable transactions={transactionsForTable} />
      </MainCard>
    </Stack>
  );
}
