import { Stack, Text, Title } from '@mantine/core';
import getSessionEmail from '@/utils/get-session-email';
import { Suspense } from 'react';
import MainCard from '../../components/main-card';
import AccessBlocked from '../../components/access-blocked';
import PocketTable from './components/pocket-table';
import PocketTableSkeleton from './components/pocket-table/skeleton';

export const metadata = {
  title: 'Kantong',
};

export default async function Page() {
  const email = await getSessionEmail();

  if (!email) {
    return <AccessBlocked />;
  }

  return (
    <MainCard>
      <Stack gap={0} className="text-center sm:text-left">
        <Title>Daftar Kantong</Title>
        <Text>
          Semua tempat penyimpanan uang Anda seperti akun bank, cash, atau
          e-wallet untuk memantau saldo secara keseluruhan
        </Text>
      </Stack>
      <Suspense fallback={<PocketTableSkeleton />}>
        <PocketTable email={email} />
      </Suspense>
    </MainCard>
  );
}
