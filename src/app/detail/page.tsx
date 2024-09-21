import { Badge, Button, Stack, Text, Title } from '@mantine/core';
import { BUTTON_BASE_COLOR, TEXT_COLOR } from '@/config/color';
import getSessionEmail from '@/utils/get-session-email';
import { Transaction } from '@prisma/client';
import getEnvironmentMode from '@/utils/get-environment-mode';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import DetailTable from './detail-table';
import MainCard from '../components/main-card';
import getTotalBalance from '../actions/functions/get-total-balance';
import AccessBlocked from '../components/access-blocked';
import { getTransaction } from '../actions/db/transaction';
import FailedState from '../components/failed-state';
import PrettyJSON from '../components/pretty-json';

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  const userBalance = await getTotalBalance({ email });
  const transactions = (await getTransaction({
    email,
    options: {
      pocket: true,
      category: true,
    },
  })) as Transaction[];

  if (!transactions) {
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
        <Title c={TEXT_COLOR}>Daftar Keuangan</Title>
        <Text>Pantau detail semua transaksi keuangan Anda di sini</Text>
      </Stack>
      <div className="flex flex-col w-full sm:justify-between sm:flex-row gap-2">
        <div className="flex flex-col items-center sm:items-start">
          <Text>Total Saldo :</Text>
          <Badge color="teal">Rp. {userBalance}</Badge>
        </div>
        <Button
          color={BUTTON_BASE_COLOR}
          leftSection={<IconPlus />}
          component={Link}
          href="/detail/add"
        >
          Tambah Data Keuangan
        </Button>
      </div>
      <DetailTable transactions={transactionsForTable} />
      {isDev && <PrettyJSON content={transactions} />}
    </MainCard>
  );
}
