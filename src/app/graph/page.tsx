import { Badge, NumberFormatter, Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Category, Pocket, Transaction } from '@prisma/client';
import MainCard from '../components/main-card';
import DetailChart from './chart';
import AccessBlocked from '../components/access-blocked';
import { getTransaction } from '../actions/db/transaction';
import getTotalBalance from '../actions/functions/get-total-balance';
import { getPocket } from '../actions/db/pocket';
import { getCategory } from '../actions/db/category';
import FailedState from '../components/failed-state';

export const metadata = {
  title: 'Grafik Keuangan',
}

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const transactions = (await getTransaction({
    email,
    options: {
      category: true,
      pocket: true,
      pocketSource: true,
      pocketDestination: true,
    },
  })) as Transaction[];
  const pockets = (await getPocket({ email })) as Pocket[];
  const categories = (await getCategory({ email })) as Category[];

  if (!transactions || !pockets || !categories) {
    return <FailedState />;
  }

  const userBalance = getTotalBalance({ transactions });

  return (
    <MainCard transparent noPadding>
      <MainCard>
        <Stack gap={0} className="text-center sm:text-start">
          <Title>Visualisasi Data Keuangan</Title>
          <Text>Monitor trend data keuangan anda</Text>
        </Stack>
        <div className="flex flex-col items-center sm:items-start">
          <Text>Total saldo :</Text>
          <Badge color="teal">
            <NumberFormatter
              prefix="Rp "
              value={userBalance}
              thousandSeparator
            />
          </Badge>
        </div>
        <DetailChart
          transactions={transactions}
          pockets={pockets}
          categories={categories}
        />
      </MainCard>
    </MainCard>
  );
}
