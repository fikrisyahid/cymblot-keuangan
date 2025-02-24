import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Category, Pocket, Transaction } from '@prisma/client';
import MainCard from '../components/main-card';
import DetailChart from './chart';
import AccessBlocked from '../components/access-blocked';
import { getTransaction } from '../actions/db/transaction';
import { getPocket } from '../actions/db/pocket';
import { getCategory } from '../actions/db/category';
import FailedState from '../components/failed-state';

export const metadata = {
  title: 'Grafik Keuangan',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const [transactions, pockets, categories] = await Promise.all([
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
    getPocket({ email }) as Promise<Pocket[]>,
    getCategory({ email }) as Promise<Category[]>,
  ]);

  if (!transactions || !pockets || !categories) {
    return <FailedState />;
  }

  return (
    <MainCard transparent noPadding>
      <MainCard>
        <Stack gap={0} className="text-center sm:text-start">
          <Title>Visualisasi Data Keuangan</Title>
          <Text>Monitor trend data keuangan anda</Text>
        </Stack>
        <DetailChart
          transactions={transactions}
          pockets={pockets}
          categories={categories}
        />
      </MainCard>
    </MainCard>
  );
}
