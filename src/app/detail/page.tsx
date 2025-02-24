import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Category, Pocket, Transaction } from '@prisma/client';
import getEnvironmentMode from '@/utils/get-environment-mode';
import DetailTable from './detail-table';
import MainCard from '../components/main-card';
import AccessBlocked from '../components/access-blocked';
import { getTransaction } from '../actions/db/transaction';
import FailedState from '../components/failed-state';
import PrettyJSON from '../components/pretty-json';
import { getCategory } from '../actions/db/category';
import { getPocket } from '../actions/db/pocket';

export const metadata = {
  title: 'Detail Keuangan',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const [transactions, categories, pockets] = await Promise.all([
    getTransaction({
      email,
      options: {
        category: true,
        pocket: true,
        pocketSource: true,
        pocketDestination: true,
      },
    }) as Promise<
      (Transaction & {
        Category: Category;
        Pocket: Pocket;
        PocketSource: Pocket;
        PocketDestination: Pocket;
      })[]
    >,
    getCategory({ email }) as Promise<Category[]>,
    getPocket({ email }) as Promise<Pocket[]>,
  ]);

  if (!transactions || !categories || !pockets) {
    return <FailedState />;
  }

  const transactionsForTable = transactions.map((transaction, index) => ({
    no: index + 1,
    ...transaction,
  }));

  const isDev = getEnvironmentMode() === 'development';

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Keuangan</Title>
        <Text>Pantau detail semua transaksi keuangan Anda di sini</Text>
      </Stack>
      <DetailTable
        transactions={transactionsForTable}
        categories={categories}
        pockets={pockets}
      />
      {isDev && <PrettyJSON content={transactions} />}
    </MainCard>
  );
}
